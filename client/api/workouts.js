import { MongoClient } from "mongodb";

/**
 * Vercel Serverless Function: Workouts API
 * ----------------------------------------
 * Handles both GET and POST requests for workout data
 * 
 * GET /api/workouts - Fetch recent workouts
 * POST /api/workouts - Create new workout
 */

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "fitness_tracker";

let cachedClient = null;

/**
 * Database Connection with Connection Pooling
 * ------------------------------------------
 * Reuses connections across serverless invocations for better performance
 */
async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  
  console.log("✅ Connected to MongoDB");
  return client;
}

/**
 * CORS Headers Configuration
 * -------------------------
 * Configures Cross-Origin Resource Sharing for production domains
 */
function setCORSHeaders(res) {
  const allowedOrigins = [
    "https://vmello.dev",
    "https://www.vmello.dev",
    "http://localhost:5173",
    "http://localhost:5174"
  ];

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Set origin dynamically based on request
  const origin = process.env.VERCEL_ENV === 'development' 
    ? "http://localhost:5173" 
    : "https://vmello.dev";
  
  res.setHeader("Access-Control-Allow-Origin", origin);
}

/**
 * GET Handler: Fetch Workouts
 * ---------------------------
 * Retrieves the most recent workout data from MongoDB
 */
async function handleGet(req, res) {
  try {
    const client = await connectToDatabase();
    const workouts = client.db(DB_NAME).collection("workouts");
    
    const results = await workouts
      .find()
      .sort({ end_date: -1 })
      .limit(20)
      .toArray();

    if (!results.length) {
      return res.status(404).json({ message: "No workouts found" });
    }

    console.log(`✅ Retrieved ${results.length} workouts`);
    return res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching workouts:", error);
    return res.status(500).json({
      error: "Failed to fetch workouts",
      message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
}

/**
 * POST Handler: Create Workout
 * ----------------------------
 * Creates a new workout entry in MongoDB
 */
async function handlePost(req, res) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Workout ID is required" });
  }

  try {
    const client = await connectToDatabase();
    const workouts = client.db(DB_NAME).collection("workouts");

    // Check for duplicate workouts
    const existingWorkout = await workouts.findOne({ id });
    if (existingWorkout) {
      console.log("⚠️ Duplicate workout detected with id:", id);
      return res.status(409).json({ error: "Duplicate workout detected" });
    }

    const workoutData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await workouts.insertOne(workoutData);
    console.log("✅ Workout saved with ID:", result.insertedId);

    return res.status(201).json({
      success: true,
      id: result.insertedId,
      message: "Workout created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating workout:", error);
    return res.status(500).json({
      error: "Failed to create workout",
      message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
}

/**
 * Main Handler Function
 * --------------------
 * Routes requests based on HTTP method
 */
export default async function handler(req, res) {
  // Set CORS headers for all requests
  setCORSHeaders(res);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Log request details
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("❌ Unhandled error in API handler:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
}