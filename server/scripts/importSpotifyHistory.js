import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Spotify Listening History Import Script
 * ---------------------------------------
 * Imports Spotify Extended Streaming History data into MongoDB
 *
 * Usage: node server/scripts/importSpotifyHistory.js
 */

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "personal_data";
const COLLECTION_NAME = "listening_history";
const SPOTIFY_DATA_PATH = "/Users/nickvmorello/Documents/Spotify/Spotify Extended Streaming History";

/**
 * Transform Spotify schema to our MongoDB schema
 * Each listening event gets a unique ID combining timestamp and track URI
 * This ensures all plays are recorded, even repeated listens to the same song
 */
function transformSpotifyRecord(record) {
  // Create unique ID for each listening event (timestamp + track URI)
  const uniqueId = `${record.ts}-${record.spotify_track_uri || 'unknown'}`;

  return {
    id: uniqueId,
    timestamp: new Date(record.ts),
    track_name: record.master_metadata_track_name,
    artist_name: record.master_metadata_album_artist_name,
    album_name: record.master_metadata_album_album_name,
    ms_played: record.ms_played,
    platform: record.platform,
    source: "spotify",
    spotify_uri: record.spotify_track_uri,
    apple_music_id: null,
    metadata: {
      conn_country: record.conn_country,
      reason_start: record.reason_start,
      reason_end: record.reason_end,
      shuffle: record.shuffle,
      skipped: record.skipped,
      offline: record.offline,
      incognito_mode: record.incognito_mode,
      episode_name: record.episode_name,
      episode_show_name: record.episode_show_name,
    },
    created_at: new Date(),
    updated_at: new Date(),
  };
}

async function importSpotifyHistory() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Create indexes for efficient queries
    console.log("📊 Creating indexes...");
    await collection.createIndex({ timestamp: -1 });
    await collection.createIndex({ artist_name: 1 });
    await collection.createIndex({ track_name: 1 });
    await collection.createIndex({ id: 1 }, { unique: true });
    console.log("✅ Indexes created");

    // Get all JSON files from Spotify directory
    console.log(`\n📁 Reading files from ${SPOTIFY_DATA_PATH}...`);
    const files = readdirSync(SPOTIFY_DATA_PATH)
      .filter(file => file.endsWith('.json'))
      .sort();

    console.log(`✅ Found ${files.length} JSON files`);

    let totalImported = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = join(SPOTIFY_DATA_PATH, file);

      console.log(`\n[${i + 1}/${files.length}] Processing ${file}...`);

      try {
        // Read and parse JSON file
        const fileContent = readFileSync(filePath, 'utf-8');
        const records = JSON.parse(fileContent);

        console.log(`   📊 Found ${records.length} records`);

        // Transform records
        const transformedRecords = records
          .filter(record => {
            // Filter out records without track names (podcasts without metadata, etc.)
            return record.master_metadata_track_name && record.master_metadata_album_artist_name;
          })
          .map(transformSpotifyRecord);

        console.log(`   ✅ Transformed ${transformedRecords.length} valid records`);

        // Batch insert with duplicate handling
        if (transformedRecords.length > 0) {
          try {
            const result = await collection.insertMany(transformedRecords, { ordered: false });
            totalImported += result.insertedCount;
            console.log(`   ✅ Inserted ${result.insertedCount} records`);
          } catch (error) {
            // Handle duplicate key errors (code 11000)
            if (error.code === 11000) {
              const insertedCount = error.result?.insertedCount || 0;
              const duplicateCount = transformedRecords.length - insertedCount;
              totalImported += insertedCount;
              totalDuplicates += duplicateCount;
              console.log(`   ✅ Inserted ${insertedCount} records`);
              console.log(`   ⚠️  Skipped ${duplicateCount} duplicates`);
            } else {
              throw error;
            }
          }
        }

      } catch (error) {
        console.error(`   ❌ Error processing ${file}:`, error.message);
        totalErrors++;
      }
    }

    // Final summary
    const finalCount = await collection.countDocuments();

    console.log("\n" + "=".repeat(60));
    console.log("📊 IMPORT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Files processed: ${files.length}`);
    console.log(`Records imported: ${totalImported}`);
    console.log(`Duplicates skipped: ${totalDuplicates}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Total records in database: ${finalCount}`);
    console.log("=".repeat(60));

    if (totalErrors === 0) {
      console.log("✅ Import completed successfully!");
    } else {
      console.log("⚠️  Import completed with some errors. Please review the logs above.");
    }

  } catch (error) {
    console.error("❌ Import failed:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the import
importSpotifyHistory().catch(console.error);
