/**
 * Local Apple Music User Token Capture
 * ------------------------------------
 * A throwaway, localhost-only helper to capture a Music User Token via MusicKit
 * JS without needing the full app/Mongo running.
 *
 *   node scripts/captureAppleUserToken.js   (run from the server/ directory)
 *
 * Then open http://localhost:4317/ , click Authorize, sign in to Apple Music.
 * The token is written to server/.env (APPLE_MUSIC_USER_TOKEN) and shown on the
 * page so you can also paste it into Railway.
 *
 * Binds to 127.0.0.1 only — it is a local dev tool, not part of the deployed app.
 */

import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getDeveloperToken } from "../appleMusic.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, "..", ".env");
const PORT = 4317;

const app = express();
app.use(express.json());

app.get("/api/apple-music/dev-token", async (req, res) => {
  try {
    res.json({ token: await getDeveloperToken() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Upsert APPLE_MUSIC_USER_TOKEN into server/.env */
app.post("/save", (req, res) => {
  const token = req.body?.token;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "missing token" });
  }
  let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  const line = `APPLE_MUSIC_USER_TOKEN=${token}`;
  if (/^#?\s*APPLE_MUSIC_USER_TOKEN=.*$/m.test(env)) {
    env = env.replace(/^#?\s*APPLE_MUSIC_USER_TOKEN=.*$/m, line);
  } else {
    env = env.replace(/\s*$/, "") + "\n" + line + "\n";
  }
  writeFileSync(ENV_PATH, env);
  console.log("✅ Saved APPLE_MUSIC_USER_TOKEN to server/.env");
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  const page = readFileSync(join(__dirname, "..", "apple-auth.html"), "utf8")
    // Point MusicKit JS at this capture server's dev-token route, and POST the
    // captured token back to /save so it lands in .env automatically.
    .replace(
      "out.textContent = \"APPLE_MUSIC_USER_TOKEN=\" + userToken;",
      `out.textContent = "APPLE_MUSIC_USER_TOKEN=" + userToken;
          fetch("/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: userToken }) })
            .then(() => { out.textContent += "\\n\\n✓ Saved to server/.env"; });`
    );
  res.type("html").send(page);
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`🎟️  Apple Music token capture: http://localhost:${PORT}/`);
});
