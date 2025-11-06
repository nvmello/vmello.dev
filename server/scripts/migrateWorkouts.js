import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

/**
 * Workout Migration Script
 * -------------------------
 * Migrates workout data from fitness_tracker database to personal_data database
 *
 * Usage: node server/scripts/migrateWorkouts.js
 */

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const OLD_DB_NAME = "fitness_tracker";
const NEW_DB_NAME = "personal_data";
const COLLECTION_NAME = "workouts";

async function migrateWorkouts() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // Get source and destination databases
    const oldDb = client.db(OLD_DB_NAME);
    const newDb = client.db(NEW_DB_NAME);

    // Get source collection
    const sourceCollection = oldDb.collection(COLLECTION_NAME);
    const destinationCollection = newDb.collection(COLLECTION_NAME);

    // Check if destination already has data
    const existingCount = await destinationCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Destination collection already has ${existingCount} documents`);
      console.log("Migration aborted to prevent duplicates. Delete existing data first if you want to re-migrate.");
      return;
    }

    // Get all workouts from source
    console.log(`📊 Fetching workouts from ${OLD_DB_NAME}.${COLLECTION_NAME}...`);
    const workouts = await sourceCollection.find().toArray();
    console.log(`✅ Found ${workouts.length} workouts to migrate`);

    if (workouts.length === 0) {
      console.log("ℹ️  No workouts to migrate");
      return;
    }

    // Insert into destination
    console.log(`📥 Inserting workouts into ${NEW_DB_NAME}.${COLLECTION_NAME}...`);
    const result = await destinationCollection.insertMany(workouts);
    console.log(`✅ Successfully inserted ${result.insertedCount} workouts`);

    // Verify counts match
    const sourceCount = await sourceCollection.countDocuments();
    const destinationCount = await destinationCollection.countDocuments();

    console.log("\n📊 Migration Summary:");
    console.log(`   Source (${OLD_DB_NAME}): ${sourceCount} documents`);
    console.log(`   Destination (${NEW_DB_NAME}): ${destinationCount} documents`);

    if (sourceCount === destinationCount) {
      console.log("✅ Migration completed successfully! Counts match.");
    } else {
      console.log("⚠️  Warning: Counts don't match. Please verify the data.");
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the migration
migrateWorkouts().catch(console.error);
