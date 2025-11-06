import { Db, MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";

/**
 * Server Architecture Overview:
 * ---------------------------
 * This fitness tracker server implements a hybrid communication architecture:
 * 1. REST API (Express): Handles CRUD operations for workouts
 * 2. WebSocket: Provides real-time updates for new workouts
 * 3. MongoDB: Persistent storage for workout data
 *
 * Data Flow:
 * ---------
 * 1. Creating a workout:
 *    Client → POST /api/workouts
 *          → Server saves to MongoDB
 *          → Server broadcasts to WebSocket clients
 *          → Connected clients receive update
 *
 * 2. Fetching workouts:
 *    Client → GET /api/workouts
 *          → Server fetches from MongoDB
 *          → Returns last up to 20 workouts
 */

// Load environment variables
dotenv.config();

/**
 * Server Initialization
 * -------------------
 * Creates three core components:
 * 1. Express app for REST endpoints
 * 2. HTTP server wrapping Express
 * 3. WebSocket server attached to HTTP server
 */
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

/**
 * WebSocket Client Management
 * -------------------------
 * Maintains a Set of all connected WebSocket clients
 * for broadcasting updates
 */
const clients = new Set();

// Validate environment variables
if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable");
}

// Safely log configuration (without exposing sensitive data)
console.log("Environment variables loaded:");
console.log(
  "- MONGODB_URI:",
  process.env.MONGODB_URI ? "Defined" : "Not defined"
);

/**
 * Server Configuration
 * ------------------
 * Defines core constants for server setup
 */
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "personal_data";

/**
 * MongoDB Connection
 * ----------------
 * Initializes connection to MongoDB for workout data persistence
 */
const client = new MongoClient(MONGODB_URI);

/**
 * Middleware Configuration
 * ----------------------
 * Sets up:
 * 1. JSON parsing
 * 2. CORS headers
 * 3. Request logging
 * 4. Error handling
 */
app.use(express.json());

// CORS middleware with secure configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://vmello.dev",
    "https://www.vmello.dev",
    "http://localhost:5173",
  ];
  const origin = req.headers.origin;

  // Also allow Vercel preview deployments for your project
  // Matches: vmello-*.vercel.app, vmello-dev-git-*.vercel.app, etc.
  if (origin?.match(/^https:\/\/vmello-.*-nicks-projects-.*\.vercel\.app$/)) {
    allowedOrigins.push(origin);
  }

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Request logging middleware with timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📥 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length) {
    console.log("📦 Request body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/**
 * WebSocket Connection Handler
 * -------------------------
 * Manages WebSocket lifecycle:
 * 1. Client connection
 * 2. Client disconnection
 * 3. Error handling
 */
wss.on("connection", (ws) => {
  console.log("🔌 New WebSocket client connected");
  clients.add(ws);

  ws.on("close", () => {
    console.log("🔌 WebSocket client disconnected");
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });
});

/**
 * Workout Broadcasting
 * ------------------
 * Sends new workout notifications to all connected WebSocket clients
 * Called automatically after successful workout creation
 */
function broadcastNewWorkout(workout) {
  const message = JSON.stringify({
    type: "new_workout",
    workout: workout,
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        console.log("📢 Broadcasted new workout to client");
      } catch (error) {
        console.error("❌ Error broadcasting to client:", error);
      }
    }
  });
}

/**
 * Track Broadcasting
 * ------------------
 * Sends new listening history notifications to all connected WebSocket clients
 * Called automatically after successful track creation
 */
function broadcastNewTrack(track) {
  const message = JSON.stringify({
    type: "new_track",
    track: track,
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        console.log("📢 Broadcasted new track to client");
      } catch (error) {
        console.error("❌ Error broadcasting to client:", error);
      }
    }
  });
}

/**
 * Database Connection Helper
 * ------------------------
 * Establishes and verifies MongoDB connection
 * Returns database instance for operations
 */
async function connectToDatabase() {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("📍 Connection string:", MONGODB_URI ? "Configured" : "Missing");
    
    await client.connect();
    console.log("✅ Successfully connected to MongoDB.");
    
    // Test the connection
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log(`📊 Database '${DB_NAME}' has ${collections.length} collections`);
    
    return db;
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    console.error("Full error details:", error);
    throw error; // Re-throw to prevent server from starting with broken DB
  }
}

/**
 * Route Handler: Create Workout
 * --------------------------
 * POST /api/workouts
 *
 * Flow:
 * 1. Validates workout data
 * 2. Checks for duplicates
 * 3. Saves to MongoDB
 * 4. Broadcasts to WebSocket clients
 * 5. Returns confirmation to client
 */
async function createWorkoutHandler(req, res) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Workout ID is required" });
  }

  try {
    const workouts = client.db(DB_NAME).collection("workouts");

    const existingWorkout = await workouts.findOne({ id });
    if (existingWorkout) {
      console.log("⚠️ Duplicate workout detected with id:", id);
      return res.status(409).json({ error: "Duplicate workout detected" });
    }

    const workoutData = {
      ...req.body,
      start_date: new Date(req.body.start_date),
      end_date: new Date(req.body.end_date),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await workouts.insertOne(workoutData);
    console.log("✅ Workout saved with ID:", result.insertedId);

    // Broadcast the new workout to all connected clients
    broadcastNewWorkout(workoutData);

    res.status(201).json({
      success: true,
      id: result.insertedId,
      message: "Workout created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating workout:", error);
    res.status(500).json({
      error: "Failed to create workout",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Route Handler: Get Workouts
 * ------------------------
 * GET /api/workouts
 *
 * Flow:
 * 1. Queries MongoDB for workouts
 * 2. Sorts by end_date (descending)
 * 3. Limits to 20 most recent workouts
 * 4. Returns workout list to client
 */
async function getWorkoutsHandler(req, res) {
  try {
    const workouts = client.db(DB_NAME).collection("workouts");
    const results = await workouts
      .find()
      .sort({ created_at: -1, end_date: -1 })
      .limit(20)
      .toArray();

    if (!results.length) {
      return res.status(404).json({ message: "No workouts found" });
    }

    res.json(results);
  } catch (error) {
    console.error("❌ Error fetching workouts:", error);
    res.status(500).json({
      error: "Failed to fetch workouts",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Route Handler: Create Listening History Entry
 * ------------------------------------------
 * POST /api/listening-history
 *
 * Flow:
 * 1. Validates track data
 * 2. Checks for duplicates
 * 3. Saves to MongoDB
 * 4. Broadcasts to WebSocket clients
 * 5. Returns confirmation to client
 */
async function createListeningHistoryHandler(req, res) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Track ID is required" });
  }

  try {
    const listeningHistory = client.db(DB_NAME).collection("listening_history");

    const existingTrack = await listeningHistory.findOne({ id });
    if (existingTrack) {
      console.log("⚠️ Duplicate track detected with id:", id);
      return res.status(409).json({ error: "Duplicate track detected" });
    }

    const trackData = {
      ...req.body,
      timestamp: new Date(req.body.timestamp),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await listeningHistory.insertOne(trackData);
    console.log("✅ Track saved with ID:", result.insertedId);

    // Broadcast the new track to all connected clients
    broadcastNewTrack(trackData);

    res.status(201).json({
      success: true,
      id: result.insertedId,
      message: "Listening history entry created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating listening history:", error);
    res.status(500).json({
      error: "Failed to create listening history entry",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Route Handler: Get Listening History
 * ----------------------------------
 * GET /api/listening-history
 *
 * Flow:
 * 1. Queries MongoDB for tracks
 * 2. Sorts by timestamp (descending)
 * 3. Limits to 50 most recent tracks
 * 4. Returns track list to client
 */
async function getListeningHistoryHandler(req, res) {
  try {
    const listeningHistory = client.db(DB_NAME).collection("listening_history");
    const results = await listeningHistory
      .find()
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    if (!results.length) {
      return res.status(404).json({ message: "No listening history found" });
    }

    res.json(results);
  } catch (error) {
    console.error("❌ Error fetching listening history:", error);
    res.status(500).json({
      error: "Failed to fetch listening history",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Route Handler: Get Listening Statistics
 * -------------------------------------
 * GET /api/listening-history/stats
 *
 * Returns aggregated statistics:
 * - Trending track (most played in last 7 days)
 * - Top artist (most listened artist)
 * - Total plays today
 */
async function getListeningStatsHandler(req, res) {
  try {
    const listeningHistory = client.db(DB_NAME).collection("listening_history");

    // Get date 7 days ago for trending calculation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get start of today for today's count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Trending track (most played in last 7 days)
    const trendingTrack = await listeningHistory
      .aggregate([
        { $match: { timestamp: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              track: "$track_name",
              artist: "$artist_name",
              spotify_uri: "$spotify_uri",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    // Top artist (all time)
    const topArtist = await listeningHistory
      .aggregate([
        {
          $group: {
            _id: "$artist_name",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    // Total plays today
    const playsToday = await listeningHistory.countDocuments({
      timestamp: { $gte: todayStart },
    });

    res.json({
      trending_track: trendingTrack[0] || null,
      top_artist: topArtist[0] || null,
      plays_today: playsToday,
    });
  } catch (error) {
    console.error("❌ Error fetching listening statistics:", error);
    res.status(500).json({
      error: "Failed to fetch listening statistics",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Route definitions
app.post("/api/workouts", createWorkoutHandler);
app.get("/api/workouts", getWorkoutsHandler);
app.post("/api/listening-history", createListeningHistoryHandler);
app.get("/api/listening-history", getListeningHistoryHandler);
app.get("/api/listening-history/stats", getListeningStatsHandler);

/**
 * Graceful Shutdown Handler
 * ----------------------
 * Ensures clean closure of:
 * 1. Database connections
 * 2. Server connections
 * When receiving SIGTERM signal
 */
process.on("SIGTERM", async () => {
  console.log(
    "🛑 SIGTERM received. Closing HTTP server and database connection..."
  );
  await client.close();
});

/**
 * Server Startup
 * ------------
 * Initializes the server by:
 * 1. Connecting to MongoDB
 * 2. Starting HTTP server
 * 3. Enabling WebSocket server
 */
async function startServer() {
  try {
    await connectToDatabase();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`🔌 WebSocket server is running`);
      console.log(`📅 Server started at: ${new Date().toISOString()}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

// Start the server
startServer().catch(console.error);

export default app;
