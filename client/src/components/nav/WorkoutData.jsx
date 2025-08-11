import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";
import iconMap from "../util/IconMap";
/**
 * WorkoutData Component
 *
 * This component displays the latest workout information and maintains a real-time
 * connection to receive workout updates. It combines REST API fetching for initial
 * data with WebSocket connectivity for live updates.
 *
 * State Management:
 * - workout: Stores the current workout data
 * - error: Tracks any error states
 * - isLoading: Indicates data fetching status
 * - wsRef: Maintains WebSocket connection reference
 */
function WorkoutData() {
  // Store the latest workout data
  const [workouts, setWorkouts] = useState([]);
  // Track any errors that occur during data fetching or WebSocket operations
  const [error, setError] = useState(null);
  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);
  // Persist WebSocket connection across re-renders using useRef
  const wsRef = useRef(null);

  const { colorScheme } = useColorContext();

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
      // In production, use relative API path; in development, use environment variable
      const apiUrl = import.meta.env.PROD 
        ? '/api/workouts' 
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
          <MyIcon
            icon="fa-solid fa-exclamation-triangle"
            size={`text-xs ${
              colorScheme.bg === "bg-[#000000]" ? "text-red-400" : "text-red-600"
            }`}
          />
          <span
            className={`${
              colorScheme.bg === "bg-[#000000]" ? "text-red-400" : "text-red-600"
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
        <MyIcon
          icon="fa-solid fa-dumbbell"
          size={`text-xs ${
            colorScheme.bg === "bg-[#000000]" ? "text-[#00ff00]" : "text-green-600"
          }`}
        />
        <span className={`${colorScheme.text} font-medium`}>
          Today's Gains:
        </span>
        {workouts.length > 0 ? (
          <div className="flex items-center space-x-1">
            {workouts.map((workout, index) => (
              <span key={workout.id} className="flex items-center">
                <span
                  className={
                    colorScheme.bg === "bg-[#000000]"
                      ? "text-[#00ff00]"
                      : "text-green-700"
                  }
                >
                  {iconMap[workout.type]}
                </span>
                {index < workouts.length - 1 && (
                  <span className={`mx-1 ${colorScheme.text}`}>+</span>
                )}
              </span>
            ))}
            <span className={`ml-2 text-xs ${colorScheme.text} opacity-75`}>
              ({workouts.length} workout{workouts.length > 1 ? "s" : ""})
            </span>
          </div>
        ) : (
          <span
            className={
              colorScheme.bg === "bg-[#000000]"
                ? "text-orange-400"
                : "text-orange-600"
            }
          >
            <MyIcon icon="fa-duotone fa-solid fa-potato" />
          </span>
        )}
      </div>
    </div>
  );
}

export default WorkoutData;
