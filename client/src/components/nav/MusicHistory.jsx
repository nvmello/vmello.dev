import { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { ColorContext } from '../../context/ColorContext';

/**
 * MusicHistory Component
 * ----------------------
 * Displays recent music listening history from personal_data.listening_history collection
 *
 * Features:
 * - Fetches recent tracks on mount via REST API
 * - Receives real-time updates via WebSocket
 * - Shows "Now Playing" or "Recently Played" based on timestamp
 * - Displays track name and artist
 * - Links to Spotify/Apple Music
 */

const MusicHistory = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const { color } = useContext(ColorContext);

  // API and WebSocket URLs
  const API_URL = import.meta.env.VITE_MUSIC_API_URL || 'http://localhost:3000/api/listening-history';
  const WS_URL = import.meta.env.VITE_MUSIC_WS_URL || 'ws://localhost:3000';

  // Fetch initial listening history
  useEffect(() => {
    const fetchListeningHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) {
          if (response.status === 404) {
            setCurrentTrack(null);
            setIsLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          // Get most recent track
          setCurrentTrack(data[0]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching listening history:', err);
        setError('Failed to load music history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListeningHistory();
  }, [API_URL]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('🔌 Connected to music WebSocket');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'new_track' && message.track) {
              console.log('🎵 Received new track:', message.track);
              setCurrentTrack(message.track);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('🔌 Disconnected from music WebSocket');
        };
      } catch (err) {
        console.error('Error connecting to WebSocket:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [WS_URL]);

  // Determine if track is "now playing" (within last 5 minutes)
  const isNowPlaying = (timestamp) => {
    if (!timestamp) return false;
    const trackTime = new Date(timestamp);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    return trackTime >= fiveMinutesAgo;
  };

  // Format track display
  const getTrackDisplay = () => {
    if (isLoading) return 'Loading...';
    if (error) return error;
    if (!currentTrack) return 'No recent tracks';

    const label = isNowPlaying(currentTrack.timestamp) ? 'Now Playing:' : 'Recently Played:';
    const trackInfo = `${currentTrack.track_name} - ${currentTrack.artist_name}`;

    return (
      <>
        <span className="font-semibold">{label}</span> {trackInfo}
      </>
    );
  };

  // Get external link (Spotify or Apple Music)
  const getExternalLink = () => {
    if (!currentTrack) return null;

    if (currentTrack.spotify_uri) {
      return `https://open.spotify.com/track/${currentTrack.spotify_uri.split(':')[2]}`;
    } else if (currentTrack.apple_music_id) {
      return `https://music.apple.com/us/song/${currentTrack.apple_music_id}`;
    }

    return null;
  };

  const externalLink = getExternalLink();

  return (
    <div className="flex items-center gap-2 px-4 whitespace-nowrap">
      <FontAwesomeIcon
        icon={faHeadphones}
        className="text-xl"
        style={{ color: color }}
      />
      {externalLink ? (
        <a
          href={externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          style={{ color: color }}
        >
          {getTrackDisplay()}
        </a>
      ) : (
        <span style={{ color: color }}>
          {getTrackDisplay()}
        </span>
      )}
    </div>
  );
};

export default MusicHistory;
