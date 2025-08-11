import { useState, useEffect } from "react";
import { useColorContext } from "../../context/ColorContext";

function Spotify() {
  const { colorScheme } = useColorContext();

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
    <div className="flex items-center space-x-2 text-sm whitespace-nowrap">
      <div
        className={`
        flex items-center space-x-2 px-3 py-1 rounded-full
        ${
          colorScheme.bg === "bg-[#000000]"
            ? "bg-[#030303] border border-[#111111]"
            : "bg-gray-100/80 border border-gray-200"
        }
      `}
      >
        <div
          className={`
          p-1 rounded-full
          ${colorScheme.bg === "bg-[#000000]" ? "bg-[#00ff00]/20" : "bg-green-100"}
        `}
        >
          <svg
            className={`w-3 h-3 ${
              colorScheme.bg === "bg-[#000000]"
                ? "text-[#00ff00]"
                : "text-green-600"
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.78-1.681-6.281-2.06-10.4-1.12-.392.1-.8-.12-.9-.52-.12-.41.12-.8.52-.9 4.56-1.021 8.52-.6 11.64 1.32.36.22.48.66.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.42.18.6.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.78-.18-.6.18-1.2.78-1.38 4.32-1.32 11.4-1.08 15.72 1.56.54.3.78 1.02.48 1.56-.3.54-1.02.78-1.56.48z" />
          </svg>
        </div>
        <span className={`${colorScheme.text} font-medium`}>On Repeat:</span>
        <a
          href={currentTrack.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            transition-colors duration-200 font-medium max-w-xs truncate
            ${
              colorScheme.bg === "bg-[#000000]"
                ? "text-[#00ff00] hover:text-[#00dd00]"
                : "text-green-700 hover:text-green-800"
            }
          `}
        >
          {currentTrack.name}
          {currentTrack.artist && (
            <span className={`${colorScheme.text} font-normal`}>
              {" by " + currentTrack.artist}
            </span>
          )}
        </a>
      </div>
    </div>
  );
}

export default Spotify;
