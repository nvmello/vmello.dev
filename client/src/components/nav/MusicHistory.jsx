import { useEffect, useState, useMemo, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { faSpotify, faApple } from '@fortawesome/free-brands-svg-icons';
import { useColorContext } from '../../context/ColorContext';

/**
 * MusicHistory Component
 * ----------------------
 * Displays top artist from the last 60 days from personal_data.listening_history collection
 *
 * Features:
 * - Fetches top artist on mount via REST API
 * - Shows "On Repeat:" with the most listened to artist
 * - Refreshes hourly
 * - Shows Spotify/Apple Music icons that fade in on hover
 */

const MusicHistory = () => {
  const [topArtist, setTopArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const { colorScheme } = useColorContext();
  const color = colorScheme.accent.replace('text-[', '').replace(']', ''); // Extract hex color
  const titleColor = colorScheme.title.replace('text-[', '').replace(']', ''); // Extract title color

  // API URL
  const API_URL = import.meta.env.MODE === 'production'
    ? 'https://vmellodev-production.up.railway.app/api/listening-history/top-artist'
    : (import.meta.env.VITE_MUSIC_API_URL || 'http://localhost:3000/api/listening-history/top-artist');

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
        console.error('Error fetching top artist:', err);
        setError('Failed to load top artist');
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
    if (!topArtist) return <span style={{ color: titleColor }}>No listening data</span>;

    return (
      <>
        <span className="font-semibold" style={{ color: titleColor }}>On Repeat:</span>{' '}
        <span style={{ color: color }}>{topArtist.artist_name}</span>
      </>
    );
  }, [topArtist, isLoading, error, color, titleColor]);

  // Generate platform URLs
  // For Spotify: Use direct artist link if we have URI, otherwise search
  const spotifyUrl = useMemo(() => {
    if (!topArtist) return null;

    if (topArtist.spotify_uri) {
      // Extract artist ID from Spotify URI (format: spotify:artist:ID or spotify:track:ID)
      const uriParts = topArtist.spotify_uri.split(':');
      if (uriParts[1] === 'artist') {
        return `https://open.spotify.com/artist/${uriParts[2]}`;
      }
      // If it's a track URI, link to the track (user can navigate to artist from there)
      if (uriParts[1] === 'track') {
        return `https://open.spotify.com/track/${uriParts[2]}`;
      }
    }

    // Fallback to search
    return `https://open.spotify.com/search/${encodeURIComponent(topArtist.artist_name)}`;
  }, [topArtist]);

  // For Apple Music: Use direct artist link if we have ID, otherwise search
  const appleMusicUrl = useMemo(() => {
    if (!topArtist) return null;

    if (topArtist.apple_music_artist_id) {
      // Direct link to artist page
      return `https://music.apple.com/us/artist/${topArtist.apple_music_artist_id}`;
    }

    // Fallback to search
    return `https://music.apple.com/us/search?term=${encodeURIComponent(topArtist.artist_name)}`;
  }, [topArtist]);

  return (
    <div
      className="relative flex items-center gap-2 px-4 whitespace-nowrap cursor-pointer transition-all duration-300"
      onMouseEnter={() => !isLoading && !error && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <FontAwesomeIcon
        icon={faHeadphones}
        className="text-xl transition-opacity duration-300"
        style={{
          color: color,
          opacity: isHovered ? 0 : 1
        }}
      />

      {/* Artist name - fades out when hovered */}
      <span
        className="transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0 : 1
        }}
      >
        {artistDisplay}
      </span>

      {/* Music platform icons - fade in when hovered, positioned absolutely */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-4 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
        }}
      >
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform duration-200"
          style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon
            icon={faSpotify}
            className="text-3xl"
            style={{ color: '#1DB954' }}
          />
        </a>

        <a
          href={appleMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform duration-200"
          style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon
            icon={faApple}
            className="text-3xl"
            style={{ color: colorScheme.bg === 'bg-[#000000]' ? '#ffffff' : '#000000' }}
          />
        </a>
      </div>
    </div>
  );
};

// Wrap in memo to prevent unnecessary re-renders when parent updates
export default memo(MusicHistory);
