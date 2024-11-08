// Backend (server.js)
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// // Store workout data in memory (replace with database in production)
let currentWorkout = {};

// GET endpoint to retrieve workout data
app.get("/api/workout", (req, res) => {
  res.json(currentWorkout);
});

// POST endpoint to update workout data
app.post("/api/workout", (req, res) => {
  const workoutData = req.body;
  currentWorkout = workoutData;
  console.log("Workout data received:", workoutData);
  res.status(200).json({ message: "Workout data received successfully!" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
