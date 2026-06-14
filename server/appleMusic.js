/**
 * Apple Music Server-Side Integration
 * -----------------------------------
 * Replaces the on-device `nvmMusic` iOS app with an autonomous, server-side
 * poll of the Apple Music API — the same way the old Spotify integration worked.
 *
 * Two credentials are required:
 *   1. Developer Token  — a short-lived ES256 JWT this server signs itself using
 *      a MusicKit private key (.p8) from the Apple Developer portal.
 *   2. Music User Token  — captured ONCE by the account owner via MusicKit JS
 *      (see /apple-auth) and stored as an env var. Lets the server read YOUR
 *      personal listening history.
 *
 * Required environment variables:
 *   APPLE_TEAM_ID             10-char Apple Developer Team ID
 *   APPLE_MUSIC_KEY_ID        10-char MusicKit Key ID (the .p8 you downloaded)
 *   APPLE_MUSIC_PRIVATE_KEY   contents of the .p8 (PEM, with real or \n newlines,
 *                             OR base64 of the whole file)
 *   APPLE_MUSIC_USER_TOKEN    Music User Token from /apple-auth
 */

import { SignJWT, importPKCS8 } from "jose";

const API_BASE = "https://api.music.apple.com";

// NOTE: env vars are read lazily inside functions (not as module-level consts)
// so this module is immune to import-vs-dotenv ordering — `import` statements
// are hoisted above `dotenv.config()`, so reading at import time would see
// undefined when credentials come from a local .env file.

// Developer tokens are valid up to 6 months. We mint for 150 days and cache.
const DEV_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 150;
// Re-mint when fewer than this many seconds remain.
const DEV_TOKEN_REFRESH_MARGIN = 60 * 60;

let cachedPrivateKey = null;
let cachedDevToken = null; // { token, exp }
let cachedStorefront = null; // e.g. "us"

/** True if all credentials needed to talk to Apple are present. */
export function isAppleMusicConfigured() {
  return Boolean(
    process.env.APPLE_TEAM_ID &&
      process.env.APPLE_MUSIC_KEY_ID &&
      process.env.APPLE_MUSIC_PRIVATE_KEY &&
      process.env.APPLE_MUSIC_USER_TOKEN
  );
}

/**
 * Normalizes the private key env var into PEM. Accepts:
 *  - PEM with literal newlines
 *  - PEM with escaped "\n" (common when pasted into a single-line env var)
 *  - base64 of the raw .p8 file
 */
function decodePrivateKeyPem(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.includes("BEGIN PRIVATE KEY")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  return Buffer.from(trimmed, "base64").toString("utf8");
}

async function getPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey;
  const pem = decodePrivateKeyPem(process.env.APPLE_MUSIC_PRIVATE_KEY);
  if (!pem) throw new Error("APPLE_MUSIC_PRIVATE_KEY is not set");
  cachedPrivateKey = await importPKCS8(pem, "ES256");
  return cachedPrivateKey;
}

/**
 * Returns a cached developer token, minting a new one when missing or expiring.
 * Safe to expose to the browser (MusicKit JS needs it) — it is NOT the private
 * key and grants no access to a user's library on its own.
 */
export async function getDeveloperToken() {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const now = Math.floor(Date.now() / 1000);
  if (cachedDevToken && cachedDevToken.exp - now > DEV_TOKEN_REFRESH_MARGIN) {
    return cachedDevToken.token;
  }
  if (!teamId || !keyId) {
    throw new Error("Missing APPLE_TEAM_ID or APPLE_MUSIC_KEY_ID");
  }

  const key = await getPrivateKey();
  const exp = now + DEV_TOKEN_TTL_SECONDS;
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(key);

  cachedDevToken = { token, exp };
  console.log("🍎 Minted new Apple Music developer token");
  return token;
}

/** Authenticated GET against the Apple Music API as the configured user. */
async function appleGet(path) {
  const userToken = process.env.APPLE_MUSIC_USER_TOKEN;
  if (!userToken) throw new Error("APPLE_MUSIC_USER_TOKEN is not set");
  const devToken = await getDeveloperToken();

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${devToken}`,
      "Music-User-Token": userToken,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Apple Music API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

/** Expands an Apple artwork URL template ({w}/{h}) to a concrete size. */
function artworkUrl(artwork, size = 300) {
  if (!artwork?.url) return null;
  return artwork.url.replace("{w}", String(size)).replace("{h}", String(size));
}

/** The user's Apple Music storefront (e.g. "us"), cached. Defaults to "us". */
async function getStorefront() {
  if (cachedStorefront) return cachedStorefront;
  try {
    const json = await appleGet("/v1/me/storefront");
    cachedStorefront = json?.data?.[0]?.id || "us";
  } catch {
    cachedStorefront = "us";
  }
  return cachedStorefront;
}

/**
 * Resolves a catalog artist ID by name via search. Used when the recently-played
 * response omits the artists relationship, so the UI can deep-link to the artist
 * page instead of a search. Returns null on miss (UI falls back to search).
 */
export async function resolveArtistId(name) {
  if (!name) return null;
  try {
    const storefront = await getStorefront();
    const json = await appleGet(
      `/v1/catalog/${storefront}/search?term=${encodeURIComponent(
        name
      )}&types=artists&limit=1`
    );
    return json?.results?.artists?.data?.[0]?.id || null;
  } catch {
    return null;
  }
}

/**
 * Fetches the most recently played tracks across all of this account's devices.
 * Returns raw Apple `data` items (Song resources). No phone app required —
 * Apple updates this as you listen on any device.
 */
export async function getRecentTracks(limit = 30) {
  const json = await appleGet(
    `/v1/me/recent/played/tracks?limit=${limit}&include=artists`
  );
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Maps an Apple Music recently-played Song item into a `listening_history`
 * record for persistence. `playedAt` is the approximate play time (poll time —
 * Apple gives no per-play timestamp). The `id` is unique per play event so a
 * track played again later is stored as a distinct row.
 */
export function appleTrackToRecord(item, playedAt) {
  const attrs = item?.attributes || {};
  const songId = item?.id || null;
  const relArtistId = item?.relationships?.artists?.data?.[0]?.id || null;
  return {
    id: `${songId}-${playedAt.getTime()}`,
    timestamp: playedAt,
    track_name: attrs.name || "Unknown Track",
    artist_name: attrs.artistName || "Unknown Artist",
    album_name: attrs.albumName || "Unknown Album",
    ms_played:
      typeof attrs.durationInMillis === "number" ? attrs.durationInMillis : 0,
    platform: "server",
    source: "apple_music",
    apple_music_id: songId,
    apple_music_artist_id: relArtistId,
    spotify_uri: null,
    album_artwork_url: artworkUrl(attrs.artwork),
    genre: Array.isArray(attrs.genreNames) ? attrs.genreNames[0] || null : null,
    release_date: attrs.releaseDate || null,
    isrc: attrs.isrc || null,
    content_rating: attrs.contentRating || null,
    metadata: { polled: true },
  };
}
