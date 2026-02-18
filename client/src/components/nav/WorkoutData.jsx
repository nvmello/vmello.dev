import { useEffect, useState, useRef, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";
import iconMap from "../util/IconMap";
import { faDumbbell } from "@fortawesome/free-solid-svg-icons";
import { faStrava } from "@fortawesome/free-brands-svg-icons";

/**
 * WorkoutData Component
 * ----------------------
 * Displays today's workout information with real-time updates via WebSocket
 *
 * Features:
 * - Fetches workout data on mount via REST API
 * - Shows "Today's Gains:" with workout type icons
 * - WebSocket connection for real-time updates
 * - Shows Strava icon with smooth crossfade animations
 * - Link only accessible when logo is visible
 */

// Define animations at module level to avoid recreation
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

  [data-workout-data] .workout-content {
    animation: fadeOutUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  [data-workout-data] .workout-content.show {
    animation: fadeInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  [data-workout-data] .workout-logos {
    animation: fadeOutUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  [data-workout-data] .workout-logos.show {
    animation: fadeInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
`;
function WorkoutData() {
  // Store the latest workout data
  const [workouts, setWorkouts] = useState([]);
  // Track any errors that occur during data fetching or WebSocket operations
  const [error, setError] = useState(null);
  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);
  // Persist WebSocket connection across re-renders using useRef
  const wsRef = useRef(null);
  // Track hover state for icon color animation
  const [isHovered, setIsHovered] = useState(false);
  // Track mobile tap state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { colorScheme } = useColorContext();
  const color = colorScheme.accent.replace("text-[", "").replace("]", ""); // Extract hex color
  const titleColor = colorScheme.title.replace("text-[", "").replace("]", ""); // Extract title color

  /**
   * Fetches the most recent workout data from the REST API.
   * This serves as the initial data load before WebSocket updates begin.
   */
  // const fetchLatestWorkout = async () => {
  //   try {
  //     const response = await fetch(import.meta.env.VITE_API_URL);

  //     if (!response.ok) {
  //       throw new Error(
  //         `Network response was not ok. Status: ${response.status}`
  //       );
  //     }

  //     const data = await response.json();

  //     // If data exists, take the first workout (most recent)
  //     if (data && data.length > 0) {
  //       setWorkouts(data[0]);
  //     } else {
  //       setError("No workout data found");
  //     }
  //   } catch (error) {
  //     setError(error.message);
  //     console.error("Error fetching workout data:", error);
  //   } finally {
  //     // Always set loading to false, whether successful or not
  //     setIsLoading(false);
  //   }
  // };

  const fetchTodaysWorkouts = async () => {
    try {
      // Use Railway production API or local development API
      const apiUrl =
        import.meta.env.MODE === "production"
          ? "https://vmellodev-production.up.railway.app/api/workouts"
          : import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        console.warn("API URL not configured");
        throw new Error("API URL not configured");
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `Network response was not ok. Status ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Fetched workout data:", data);

      // Filter workouts that were completed today (original working logic)
      const todaysWorkouts = data.filter((workouts) => {
        try {
          //create Date objects for workout end time
          const workoutEndDate = new Date(workouts.end_date);

          // Format the date
          const options = { month: "short", day: "2-digit", year: "numeric" };
          const formattedWorkoutDate = workoutEndDate
            .toLocaleDateString("en-US", options)
            .replace(",", "");

          //get current date in workouts timezone
          const currentDate = new Date();

          // Format the date
          const formattedCurrentDate = currentDate
            .toLocaleDateString("en-US", options)
            .replace(",", "");

          return formattedWorkoutDate === formattedCurrentDate;
        } catch (error) {
          console.log(`Error processing workout ${workouts.id}:`, error);
          return false; // Skip entries with invalid dates
        }
      });

      console.log("Today's workouts after filtering:", todaysWorkouts);

      //remove duplicate workouts  ** may want to revert this later to show all workouts **
      if (todaysWorkouts.length > 0) {
        const uniqueWorkouts = todaysWorkouts.reduce((unique, workout) => {
          if (!unique.find((w) => w.type === workout.type)) {
            unique.push(workout);
          }
          return unique;
        }, []);

        uniqueWorkouts.sort(
          (a, b) => new Date(b.end_date) - new Date(a.end_date)
        );
        console.log("Final unique workouts to display:", uniqueWorkouts);
        setWorkouts(uniqueWorkouts);
      } else {
        console.log("No workouts found for today");
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
      setError(`Failed to fetch workouts: ${error.message}`);

      // No test data fallback - using real API only
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get initial workout data
    fetchTodaysWorkouts();

    // Initialize WebSocket connection if it doesn't exist and URL is configured
    if (!wsRef.current && import.meta.env.VITE_WS_URL) {
      console.log(
        "Attempting WebSocket connection to:",
        import.meta.env.VITE_WS_URL
      );

      try {
        // Create new WebSocket connection
        wsRef.current = new WebSocket(import.meta.env.VITE_WS_URL);

        // Handle WebSocket connection open
        wsRef.current.onopen = () => {
          console.log("✅ WebSocket connected successfully");
          // Clear any previous connection errors
          if (error && error.includes("connecting to workout updates")) {
            setError(null);
          }
        };

        // Handle incoming WebSocket messages
        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received WebSocket message:", data);

            // Update workout state if message indicates a new workout
            if (data.type === "new_workout") {
              setWorkouts((prev) => [data.workout, ...prev]);
            }
          } catch (error) {
            console.error("Error processing WebSocket message:", error);
          }
        };

        // Handle WebSocket errors
        wsRef.current.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          // Don't set error state immediately - wait for connection timeout
        };

        // Handle WebSocket connection closure
        wsRef.current.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          wsRef.current = null;

          // Only show error if it wasn't a clean close
          if (event.code !== 1000) {
            console.warn(
              "WebSocket closed unexpectedly, real-time updates disabled"
            );
          }
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
      }
    } else if (!import.meta.env.VITE_WS_URL) {
      console.warn("WebSocket URL not configured - real-time updates disabled");
    }

    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Handle click for mobile - toggle logo visibility
  const handleClick = (e) => {
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
      if (isMobileOpen && !e.target.closest("[data-workout-data]")) {
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

  // Inject styles once
  useEffect(() => {
    if (!document.getElementById("workout-data-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "workout-data-styles";
      styleEl.textContent = animationStyles;
      document.head.appendChild(styleEl);
    }
  }, []);

  // Determine if logos should be visible (hover for desktop, isMobileOpen for mobile)
  const showLogos = isHovered || isMobileOpen;

  // Show error state if any errors occurred
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div
          className={`
          flex items-center space-x-2 px-3 py-1 rounded-full
          ${
            colorScheme.bg === "bg-[#000000]"
              ? "bg-red-900/80 border border-red-800"
              : "bg-red-100/80 border border-red-200"
          }
        `}
        >
          <FontAwesomeIcon
            icon={faDumbbell}
            className="text-xl transition-opacity duration-300"
            style={{
              color: color,
              opacity: isHovered ? 0 : 1,
            }}
          />
          <span
            className={`${
              colorScheme.bg === "bg-[#000000]"
                ? "text-red-400"
                : "text-red-600"
            } font-medium text-xs`}
          >
            API Error
          </span>
        </div>
      </div>
    );
  }

  // Show loading state during initial data fetch
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm">
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
          <div className="animate-spin">
            <MyIcon
              icon="fa-solid fa-spinner"
              size={`text-xs ${
                colorScheme.bg === "bg-[#000000]"
                  ? "text-[#00ff00]"
                  : "text-green-600"
              }`}
            />
          </div>
          <span className={`${colorScheme.text} font-medium`}>
            Loading workouts...
          </span>
        </div>
      </div>
    );
  }

  // Render workout information
  return (
    <div
      data-workout-data
      className="relative flex items-center space-x-2 text-sm whitespace-nowrap cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Workout content with animation */}
      <div className={`workout-content ${showLogos ? "" : "show"}`}>
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
          <FontAwesomeIcon
            icon={faDumbbell}
            className="text-xs flex-shrink-0"
            style={{
              color: color,
            }}
          />
          <span
            className="font-medium transition-colors duration-300"
            style={{
              color: titleColor,
            }}
          >
            Today's Gains:
          </span>
          {workouts.length > 0 ? (
            <div className="flex items-center space-x-1">
              {workouts.map((workout, index) => (
                <span key={workout.id} className="flex items-center">
                  <span style={{ color: color }}>{iconMap[workout.type]}</span>
                  {index < workouts.length - 1 && (
                    <span className="mx-1" style={{ color: color }}>
                      +
                    </span>
                  )}
                </span>
              ))}
              <span
                className="ml-2 text-xs"
                style={{ color: color, opacity: 0.75 }}
              >
                ({workouts.length} workout{workouts.length > 1 ? "s" : ""})
              </span>
            </div>
          ) : (
            <span style={{ color: color }}>
              <MyIcon icon="fa-duotone fa-thin fa-potato" />
            </span>
          )}
        </div>
      </div>

      {/* Strava icon - fades in when hovered, positioned absolutely */}
      <div
        className={`workout-logos absolute inset-0 flex items-center justify-center ${showLogos ? "show" : ""}`}
        style={{
          pointerEvents: showLogos ? "auto" : "none",
        }}
      >
        <a
          href="https://strava.app.link/W4daBrWP5Xb"
          target="_blank"
          rel="noopener noreferrer"
          className="transform transition-transform duration-200 hover:scale-110 active:scale-95"
          aria-label="Open on Strava"
        >
          <FontAwesomeIcon
            icon={faStrava}
            className="text-3xl"
            style={{ color: "#FC4C02" }}
          />
        </a>
      </div>
    </div>
  );
}

export default memo(WorkoutData);
