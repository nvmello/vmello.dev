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
const wss = new WebSocketServer({
  server: httpServer,
  verifyClient: (info) => {
    const origin = info.origin;
    return (
      origin === "https://vmello.dev" || origin === "https://www.vmello.dev"
    );
  },
});

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
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "fitness_tracker";

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
// Update your CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = ["https://vmello.dev", "https://www.vmello.dev"];
  const origin = req.headers.origin;

  console.log("Incoming request from origin:", origin);

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    console.log("CORS allowed for:", origin);
  } else {
    console.log("CORS rejected for:", origin);
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
 * Database Connection Helper
 * ------------------------
 * Establishes and verifies MongoDB connection
 * Returns database instance for operations
 */
async function connectToDatabase() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    console.log("✅ Successfully connected to MongoDB.");

    // Test the connection
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name)
    );

    return client.db(DB_NAME);
  } catch (error) {
    console.error("❌ Database connection error:", error);
    // Log full error details
    console.error("Full error:", JSON.stringify(error, null, 2));
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
      .sort({ end_date: -1 })
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

// Route definitions
app.post("/api/workouts", createWorkoutHandler);
app.get("/api/workouts", getWorkoutsHandler);
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
app.get("/", (req, res) => {
  res.send({
    status: "Server is running",
    timestamp: new Date().toISOString(),
    endpoints: ["/health", "/api/workouts"],
  });
});

app.use((req, res) => {
  console.log(`404 for ${req.method} ${req.url}`);
  res.status(404).send({
    error: "Not Found",
    path: req.url,
  });
});

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
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 WebSocket server is running`);
      console.log(`📅 Server started at: ${new Date().toISOString()}`);
    });

    // Add error handler for HTTP server
    httpServer.on("error", (error) => {
      console.error("HTTP Server Error:", error);
      // Don't exit the process
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    // Don't exit on startup error, just log it
  }
}

// Start the server
startServer().catch(console.error);

export default app;
