import { useEffect, useState } from "react";

function WorkoutData() {
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://192.168.12.88:3000/api/workout")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setWorkout(data);
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error fetching workout data:", error);
      });
  }, []);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!workout) {
    return <p>Loading workout data...</p>;
  }

  return (
    <span className="text-sm whitespace-nowrap mr-8">
      <span className="font-bold">Todays workout:</span>{" "}
      {Math.round(workout.duration)} minute {workout.type} : Calories Burned:{" "}
      {Math.round(workout.calories)}{" "}
    </span>
  );
}

export default WorkoutData;
