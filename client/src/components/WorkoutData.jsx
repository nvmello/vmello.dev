import { useEffect, useState } from "react";

function WorkoutData() {
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch("http://192.168.12.113:3000/api/workouts");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Network response was not ok. Status: ${response.status}`
          );
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const latestWorkout = data[0];
          setWorkout(latestWorkout);
        } else {
          setError("No workout data found");
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching workout data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, []);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!workout) {
    return <p>Loading workout data...</p>;
  }

  return (
    <span className="text-sm whitespace-nowrap mr-8">
      <span className="font-bold">Today's workout:</span> {workout.type}
    </span>
  );
}

export default WorkoutData;
