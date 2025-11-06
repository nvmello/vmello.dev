import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "personal_data";
const COLLECTION_NAME = "listening_history";

async function dropCollection() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const count = await db.collection(COLLECTION_NAME).countDocuments();
    console.log(`📊 Current collection has ${count} documents`);

    await db.collection(COLLECTION_NAME).drop();
    console.log("✅ Dropped listening_history collection");
  } catch (error) {
    if (error.message.includes("ns not found")) {
      console.log("ℹ️  Collection doesn't exist, nothing to drop");
    } else {
      throw error;
    }
  } finally {
    await client.close();
  }
}

dropCollection().catch(console.error);
