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
      const response = await fetch(import.meta.env.VITE_API_URL);

      if (!response.ok) {
        throw new Error(
          `Network response was not ok. Status ${response.status}`
        );
      }

      const data = await response.json();

      // Filter workouts that were completed today,
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
        setWorkouts(uniqueWorkouts);
      } else {
        console.log("No workouts found for today");
      }
    } catch (error) {
      console.error(`Error processing workout ${workouts.id}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get initial workout data
    fetchTodaysWorkouts();

    // Initialize WebSocket connection if it doesn't exist
    if (!wsRef.current) {
      // Create new WebSocket connection
      wsRef.current = new WebSocket(import.meta.env.VITE_WS_URL);

      // Handle incoming WebSocket messages
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Update workout state if message indicates a new workout
          if (data.type === "new_workout") {
            setWorkouts(data.workout);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      // Handle WebSocket errors
      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Error connecting to workout updates");
      };

      // Handle WebSocket connection closure
      wsRef.current.onclose = () => {
        console.log("WebSocket connection closed");
        // Clear WebSocket reference when connection closes
        wsRef.current = null;
      };
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
    return <p>Error: {error}</p>;
  }

  // Show loading state during initial data fetch
  if (isLoading) {
    return <p>Loading workout data...</p>;
  }

  // Render workout information
  return (
    <span className="text-sm whitespace-nowrap">
      <span className={`${colorScheme.text} font-bold`}>
        Today's Gains:{" "}
        {workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <span key={workout.id}>
              {iconMap[workout.type]}
              {index < workouts.length - 1 ? " + " : ""}
            </span>
          ))
        ) : (
          <MyIcon icon="fa-duotone fa-solid fa-potato" />
        )}
      </span>
    </span>
  );
}

export default WorkoutData;
