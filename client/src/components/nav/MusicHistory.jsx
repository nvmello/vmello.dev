import { useEffect, useState, useMemo, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import { faSpotify, faApple } from "@fortawesome/free-brands-svg-icons";
import { useColorContext } from "../../context/ColorContext";

/**
 * MusicHistory Component
 * ----------------------
 * Displays top artist from the last 60 days from personal_data.listening_history collection
 *
 * Features:
 * - Fetches top artist on mount via REST API
 * - Shows "On Repeat:" with the most listened to artist
 * - Refreshes hourly
 * - Shows Spotify/Apple Music icons with smooth tap-to-reveal animations
 * - Links only accessible when logos are visible (matches WorkoutData pattern)
 */

// Define animations at module level (matching WorkoutData pattern)
const animationStyles = `
  @keyframes fadeOutUp {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-8px);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  [data-music-history] .music-content {
    animation: fadeOutUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  [data-music-history] .music-content.show {
    animation: fadeInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  [data-music-history] .music-logos {
    animation: fadeOutUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  [data-music-history] .music-logos.show {
    animation: fadeInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
`;

const MusicHistory = () => {
  const [topArtist, setTopArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { colorScheme } = useColorContext();
  const color = colorScheme.accent.replace("text-[", "").replace("]", "");
  const titleColor = colorScheme.title.replace("text-[", "").replace("]", "");

  // API URL
  const API_URL =
    import.meta.env.MODE === "production"
      ? "https://vmellodev-production.up.railway.app/api/listening-history/top-artist"
      : import.meta.env.VITE_MUSIC_API_URL ||
        "http://localhost:3000/api/listening-history/top-artist";

  // Fetch top artist
  useEffect(() => {
    const fetchTopArtist = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) {
          if (response.status === 404) {
            setTopArtist(null);
            setIsLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.artist_name) {
          setTopArtist(data);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching top artist:", err);
        setError("Failed to load top artist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopArtist();

    // Refresh every hour
    const interval = setInterval(fetchTopArtist, 3600000);
    return () => clearInterval(interval);
  }, [API_URL]);

  // Memoize artist display to prevent recalculation
  const artistDisplay = useMemo(() => {
    if (isLoading) return <span style={{ color: titleColor }}>Loading...</span>;
    if (error) return <span style={{ color: titleColor }}>{error}</span>;
    if (!topArtist)
      return <span style={{ color: titleColor }}>No listening data</span>;

    return (
      <>
        <span className="font-semibold" style={{ color: titleColor }}>
          On Repeat:
        </span>{" "}
        <span style={{ color: color }}>{topArtist.artist_name}</span>
      </>
    );
  }, [topArtist, isLoading, error, color, titleColor]);

  // Generate platform URLs
  const spotifyUrl = useMemo(() => {
    if (!topArtist) return null;

    if (topArtist.spotify_uri) {
      const uriParts = topArtist.spotify_uri.split(":");
      if (uriParts[1] === "artist") {
        return `https://open.spotify.com/artist/${uriParts[2]}`;
      }
      if (uriParts[1] === "track") {
        return `https://open.spotify.com/track/${uriParts[2]}`;
      }
    }

    return `https://open.spotify.com/search/${encodeURIComponent(
      topArtist.artist_name
    )}`;
  }, [topArtist]);

  const appleMusicUrl = useMemo(() => {
    if (!topArtist) return null;

    if (topArtist.apple_music_artist_id) {
      return `https://music.apple.com/us/artist/${topArtist.apple_music_artist_id}`;
    }

    return `https://music.apple.com/us/search?term=${encodeURIComponent(
      topArtist.artist_name
    )}`;
  }, [topArtist]);

  // Determine if logos should be visible (matches WorkoutData pattern)
  const showLogos = isHovered || isMobileOpen;

  // Handle click for mobile - toggle logo visibility (matches WorkoutData pattern exactly)
  const handleClick = (e) => {
    if (isLoading || error) return;

    // Check if clicking on a logo link
    const linkElement = e.target.closest("a");
    if (linkElement) {
      // If logos are showing, allow navigation
      if (showLogos) {
        setIsMobileOpen(false);
        return;
      }
      // Otherwise show logos and prevent navigation
      e.preventDefault();
      e.stopPropagation();
      setIsMobileOpen(true);
      return;
    }

    e.stopPropagation();
    setIsMobileOpen(!isMobileOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileOpen && !e.target.closest("[data-music-history]")) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () =>
      document.removeEventListener("click", handleClickOutside, true);
  }, [isMobileOpen]);

  // Reset mobile open state when navigating back to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Inject styles once (matches WorkoutData pattern)
  useEffect(() => {
    if (!document.getElementById("music-history-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "music-history-styles";
      styleEl.textContent = animationStyles;
      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <div
      data-music-history
      className="relative flex items-center gap-2 px-4 whitespace-nowrap cursor-pointer"
      onMouseEnter={() => !isLoading && !error && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Artist content with animation - visible by default (no "show" class) */}
      <div
        className={`music-content flex items-center gap-2 min-w-0 ${
          showLogos ? "" : "show"
        }`}
      >
        <FontAwesomeIcon
          icon={faHeadphones}
          className="text-xl flex-shrink-0"
          style={{ color }}
        />

        <span className="transition-colors duration-300">{artistDisplay}</span>
      </div>

      {/* Music platform icons - fade in when hovered/tapped */}
      <div
        className={`music-logos absolute inset-0 flex items-center justify-center gap-6 ${
          showLogos ? "show" : ""
        }`}
        style={{
          pointerEvents: showLogos ? "auto" : "none",
        }}
      >
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transform transition-transform duration-200 hover:scale-110 active:scale-95"
          aria-label="Open on Spotify"
        >
          <FontAwesomeIcon
            icon={faSpotify}
            className="text-3xl"
            style={{ color: "#1DB954" }}
          />
        </a>

        <a
          href={appleMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transform transition-transform duration-200 hover:scale-110 active:scale-95"
          aria-label="Open on Apple Music"
        >
          <FontAwesomeIcon
            icon={faApple}
            className="text-3xl"
            style={{
              color: colorScheme.bg === "bg-[#000000]" ? "#ffffff" : "#000000",
            }}
          />
        </a>
      </div>
    </div>
  );
};

export default memo(MusicHistory);
