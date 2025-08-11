import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "fitness_tracker";
const COLLECTION_NAME = "workouts";

async function migrateDates() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Find all documents where dates are stored as strings
    const docs = await collection.find({
      $or: [
        { "start_date": { $type: "string" } },
        { "end_date": { $type: "string" } },
        { "created_at": { $type: "string" } },
        { "updated_at": { $type: "string" } }
      ]
    }).toArray();
    
    console.log(`Found ${docs.length} documents with string dates to convert`);
    
    let converted = 0;
    let errors = 0;
    
    for (const doc of docs) {
      try {
        const update = {};
        
        // Convert start_date if it's a string
        if (typeof doc.start_date === 'string') {
          const startDate = new Date(doc.start_date);
          if (!isNaN(startDate.getTime())) {
            update.start_date = startDate;
          } else {
            console.warn(`Invalid start_date for doc ${doc._id}: ${doc.start_date}`);
          }
        }
        
        // Convert end_date if it's a string  
        if (typeof doc.end_date === 'string') {
          const endDate = new Date(doc.end_date);
          if (!isNaN(endDate.getTime())) {
            update.end_date = endDate;
          } else {
            console.warn(`Invalid end_date for doc ${doc._id}: ${doc.end_date}`);
          }
        }
        
        // Convert created_at if it's a string
        if (typeof doc.created_at === 'string') {
          const createdAt = new Date(doc.created_at);
          if (!isNaN(createdAt.getTime())) {
            update.created_at = createdAt;
          } else {
            console.warn(`Invalid created_at for doc ${doc._id}: ${doc.created_at}`);
          }
        }
        
        // Convert updated_at if it's a string
        if (typeof doc.updated_at === 'string') {
          const updatedAt = new Date(doc.updated_at);
          if (!isNaN(updatedAt.getTime())) {
            update.updated_at = updatedAt;
          } else {
            console.warn(`Invalid updated_at for doc ${doc._id}: ${doc.updated_at}`);
          }
        }
        
        // Update the document if we have changes to make
        if (Object.keys(update).length > 0) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: update }
          );
          
          console.log(`✅ Converted dates for workout ${doc.id || doc._id} (${doc.type})`);
          converted++;
        }
        
      } catch (error) {
        console.error(`❌ Error converting doc ${doc._id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   - Documents processed: ${docs.length}`);
    console.log(`   - Successfully converted: ${converted}`);
    console.log(`   - Errors: ${errors}`);
    
    // Verify the migration by checking data types
    console.log(`\n🔍 Verifying migration...`);
    
    const stringDatesCount = await collection.countDocuments({
      $or: [
        { "start_date": { $type: "string" } },
        { "end_date": { $type: "string" } },
        { "created_at": { $type: "string" } },
        { "updated_at": { $type: "string" } }
      ]
    });
    
    const dateDatesCount = await collection.countDocuments({
      $and: [
        { "start_date": { $type: "date" } },
        { "end_date": { $type: "date" } },
        { "created_at": { $type: "date" } },
        { "updated_at": { $type: "date" } }
      ]
    });
    
    console.log(`   - Remaining string dates: ${stringDatesCount}`);
    console.log(`   - Proper Date objects: ${dateDatesCount}`);
    
    if (stringDatesCount === 0) {
      console.log(`\n🎉 Migration completed successfully! All dates are now Date objects.`);
    } else {
      console.log(`\n⚠️  ${stringDatesCount} documents still have string dates. Check warnings above.`);
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await client.close();
    console.log("📝 Database connection closed");
  }
}

// Run the migration
console.log("🚀 Starting date migration...");
migrateDates().catch(console.error);