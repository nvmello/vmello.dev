import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

  /**
   * Fetches the most recent workout data from the REST API.
   * This serves as the initial data load before WebSocket updates begin.
   */
  const fetchLatestWorkout = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL);

      if (!response.ok) {
        throw new Error(
          `Network response was not ok. Status: ${response.status}`
        );
      }

      const data = await response.json();

      // If data exists, take the first workout (most recent)
      if (data && data.length > 0) {
        setWorkouts(data[0]);
      } else {
        setError("No workout data found");
      }
    } catch (error) {
      setError(error.message);
      console.error("Error fetching workout data:", error);
    } finally {
      // Always set loading to false, whether successful or not
      setIsLoading(false);
    }
  };

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

      if (todaysWorkouts.length > 0) {
        todaysWorkouts.sort(
          (a, b) => new Date(b.end_date) - new Date(a.end_date)
        );
        setWorkouts(todaysWorkouts);
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
    console.log(workouts);
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
    <span className="text-sm whitespace-nowrap mr-8">
      <span className="font-bold">
        Today's Gains:{" "}
        {workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <span key={workout.id}>
              {iconMap[workout.type]}
              {index < workouts.length - 1 ? " + " : ""}
            </span>
          ))
        ) : (
          <i className="fa-solid fa-potato" />
        )}
      </span>
    </span>
  );
}

export default WorkoutData;

const iconMap = {
  Pickleball: <i className="fa-solid fa-pickleball" />,
  "American Football": <i className="fa-duotone fa-solid fa-football" />,
  Archery: <i className="fa-duotone fa-solid fa-bow-arrow" />,
  "Australian Football": <i className="fa-sharp fa-regular fa-football" />,
  Badminton: <i className="fa-duotone fa-solid fa-shuttlecock" />,
  Baseball: <i className="fa-duotone fa-solid fa-baseball" />,
  Basketball: <i className="fa-duotone fa-solid fa-basketball" />,
  Bowling: <i className="fa-duotone fa-solid fa-bowling-ball" />,
  Boxing: <i className="fa-duotone fa-solid fa-boxing-glove" />,
  Climbing: <i className="fa-duotone fa-solid fa-mountains" />,
  Cricket: <i className="fa-duotone fa-solid fa-cricket-bat-ball" />,
  "Cross Training": <i className="fa-duotone fa-solid fa-dumbbell" />,
  Curling: <i className="fa-duotone fa-solid fa-curling-stone" />,
  Cycling: <i className="fa-duotone fa-solid fa-bicycle" />,
  Dance: <i className="fa-duotone fa-solid fa-people-dancing" />,
  Elliptical: <i className="fa-duotone fa-solid fa-person-running" />,
  "Equestrian Sports": <i className="fa-duotone fa-solid fa-horse" />,
  Fencing: <i className="fa-duotone fa-solid fa-sword" />,
  Fishing: <i className="fa-duotone fa-solid fa-fishing-rod" />,
  "Functional Strength Training": (
    <i className="fa-sharp fa-light fa-dumbbell" />
  ),
  Golf: <i className="fa-duotone fa-solid fa-golf-flag-hole" />,
  Gymnastics: <i className="fa-duotone fa-solid fa-person-falling" />,
  Handball: <i className="fa-solid fa-hands-holding-circle" />,
  Hiking: <i className="fa-duotone fa-solid fa-person-hiking" />,
  Hockey: <i className="fa-duotone fa-solid fa-hockey-stick" />,
  Hunting: <i className="fa-duotone fa-solid fa-person-rifle" />,
  Lacrosse: <i className="fa-duotone fa-solid fa-lacrosse-stick-ball" />,
  "Martial Arts": <i className="fa-duotone fa-solid fa-luchador-mask" />,
  "Mind and Body": <i className="fa-duotone fa-solid fa-brain" />,
  "Paddle Sports": <i className="fa-duotone fa-solid fa-kayak" />,
  Play: <i className="fa-duotone fa-solid fa-gamepad" />,
  "Preparation and Recovery": <i className="fa-duotone fa-solid fa-bed" />,
  Racquetball: (
    <i className="fa-duotone fa-solid fa-table-tennis-paddle-ball" />
  ),
  Rowing: <i className="fa-duotone fa-solid fa-person-rowing" />,
  Rugby: <i className="fa-duotone fa-solid fa-football-ball" />,
  Running: <i className="fa-duotone fa-solid fa-person-running" />,
  Sailing: <i className="fa-duotone fa-solid fa-sailboat" />,
  "Skating Sports": <i className="fa-duotone fa-solid fa-person-skating" />,
  "Snow Sports": <i className="fa-duotone fa-solid fa-person-skiing" />,
  Soccer: <i className="fa-duotone fa-solid fa-futbol" />,
  Softball: <i className="fa-duotone fa-solid fa-baseball" />,
  Squash: <i className="fa-solid fa-x" />, // Similar to racquetball but leaving for distinction
  "Stair Climbing": <i className="fa-duotone fa-solid fa-stairs" />,
  "Surfing Sports": <i className="fa-duotone fa-solid fa-person-surfing" />,
  Swimming: <i className="fa-duotone fa-solid fa-person-swimming" />,
  "Table Tennis": (
    <i className="fa-duotone fa-solid fa-table-tennis-paddle-ball" />
  ),
  Tennis: <i className="fa-duotone fa-solid fa-tennis-ball" />,
  "Track and Field": <i className="fa-duotone fa-solid fa-timer" />,
  "Traditional Strength Training": (
    <i className="fa-duotone fa-solid fa-dumbbell" />
  ),
  Volleyball: <i className="fa-duotone fa-solid fa-volleyball" />,
  Walking: <i className="fa-solid fa-person-walking" />,
  "Water Fitness": <i className="fa-duotone fa-solid fa-person-swimming" />,
  "Water Polo": <i className="fa-duotone fa-solid fa-water" />,
  "Water Sports": <i className="fa-duotone fa-solid fa-water" />,
  Wrestling: <i className="fa-duotone fa-solid fa-people-wrestling" />,
  Yoga: <i className="fa-duotone fa-solid fa-spa" />,
  Barre: <i className="fa-solid fa-x" />, // No good match
  "Core Training": (
    <i className="fa-duotone fa-solid fa-person-dots-from-line" />
  ),
  "Cross Country Skiing": (
    <i className="fa-duotone fa-solid fa-person-skiing-nordic" />
  ),
  "Downhill Skiing": <i className="fa-duotone fa-solid fa-person-skiing" />,
  Flexibility: <i className="fa-duotone fa-solid fa-person-stretching" />,
  "High Intensity Interval Training": (
    <i className="fa-duotone fa-solid fa-fire" />
  ),
  "Jump Rope": <i className="fa-solid fa-lasso" />,
  Kickboxing: <i className="fa-duotone fa-solid fa-hand-fist" />,
  Pilates: <i className="fa-duotone fa-solid fa-person-stretching" />,
  Snowboarding: <i className="fa-duotone fa-solid fa-person-snowboarding" />,
  "Step Training": <i className="fa-duotone fa-solid fa-stairs" />,
  "Wheelchair Walk Pace": <i className="fa-duotone fa-solid fa-wheelchair" />,
  "Wheelchair Run Pace": (
    <i className="fa-duotone fa-solid fa-wheelchair-move" />
  ),
  "Tai Chi": <i className="fa-duotone fa-solid fa-yin-yang" />,
  "Mixed Cardio": <i className="fa-duotone fa-solid fa-heart-pulse" />,
  "Hand Cycling": <i className="fa-duotone fa-solid fa-wheelchair" />,
  "Disc Sports": <i className="fa-duotone fa-solid fa-flying-disc" />,
  "Fitness Gaming": <i className="fa-duotone fa-solid fa-gamepad" />,
  "Other Activity": <i className="fa-duotone fa-solid fa-person" />,
};
