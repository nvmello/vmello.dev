import React, { useState, useEffect } from "react";

function Spotify() {
  const [currentTrack, setCurrentTrack] = useState({
    name: "Loading...",
    artist: "",
    link: "#",
  });

  useEffect(() => {
    const getAccessToken = async () => {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            btoa(
              import.meta.env.VITE_SPOTIFY_CLIENT_ID +
                ":" +
                import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
            ),
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN,
        }),
      });
      const data = await response.json();
      return data.access_token;
    };

    const fetchTopTrack = async () => {
      try {
        const accessToken = await getAccessToken();
        const response = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=1&time_range=short_term",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (data.items?.[0]) {
          console.log(data);
          setCurrentTrack({
            name: data.items[0].name,
            artist: data.items[0].artists[0].name,
            link: data.items[0].external_urls.spotify,
          });
        }
      } catch (error) {
        console.error("Error:", error);
        setCurrentTrack({
          name: "Unable to load track",
          artist: "",
          link: "#",
        });
      }
    };

    fetchTopTrack();
    const interval = setInterval(fetchTopTrack, 3600000); // Refresh every hour
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-sm whitespace-nowrap">
      On Repeat:{" "}
      <a
        href={currentTrack.link}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-400 transition-colors"
      >
        {currentTrack.name}
        {currentTrack.artist ? ` - ${currentTrack.artist}` : ""}
      </a>
    </h1>
  );
}

export default Spotify;
