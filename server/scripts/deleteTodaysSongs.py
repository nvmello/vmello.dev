#!/usr/bin/env python3
"""
Delete Today's Listening History
---------------------------------
Deletes all listening history entries from today (cleanup script)

Usage:
    python server/scripts/deleteTodaysSongs.py
    python server/scripts/deleteTodaysSongs.py --dry-run  # Preview without deleting
"""

import os
import sys
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "personal_data"
COLLECTION_NAME = "listening_history"

def delete_todays_songs(dry_run=False):
    """Delete all listening history entries from today"""

    if not MONGODB_URI:
        print("❌ Error: MONGODB_URI not found in environment variables")
        sys.exit(1)

    print("🔄 Connecting to MongoDB...")
    client = MongoClient(MONGODB_URI)

    try:
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        # Get start of today (midnight local time, converted to UTC for MongoDB)
        from datetime import datetime as dt
        import time

        # Get local midnight
        today_local = dt.now().replace(hour=0, minute=0, second=0, microsecond=0)
        # Convert to UTC timestamp
        today_utc_timestamp = time.mktime(today_local.timetuple())
        today_start = datetime.fromtimestamp(today_utc_timestamp, tz=timezone.utc)

        print(f"📅 Finding entries from today (since {today_start.isoformat()})...\n")

        # Find all entries from today
        query = {
            "timestamp": {"$gte": today_start}
        }

        entries = list(collection.find(query).sort("timestamp", 1))

        if not entries:
            print("✅ No entries found from today!")
            return

        print(f"📊 Found {len(entries)} entries from today:\n")
        print("─" * 80)

        # Display entries
        for i, entry in enumerate(entries, 1):
            timestamp = entry.get("timestamp", "Unknown")
            track_name = entry.get("track_name", "Unknown")
            artist_name = entry.get("artist_name", "Unknown")
            entry_id = entry.get("id", "Unknown")
            mongo_id = entry.get("_id", "Unknown")

            print(f"{i}. {track_name} - {artist_name}")
            print(f"   Timestamp: {timestamp}")
            print(f"   ID: {entry_id}")
            print(f"   MongoDB _id: {mongo_id}")
            print()

        print("─" * 80)

        if dry_run:
            print(f"\n🔍 DRY RUN - Would delete {len(entries)} entries")
            print("   Run without --dry-run to actually delete")
        else:
            # Confirm deletion
            print(f"\n⚠️  About to DELETE {len(entries)} entries from today!")

            # Check if running interactively
            try:
                response = input("Are you sure? Type 'yes' to confirm: ")
                if response.lower() != 'yes':
                    print("❌ Deletion cancelled")
                    return
            except EOFError:
                # Not interactive - check for --force flag
                if "--force" not in sys.argv:
                    print("❌ Not running interactively. Use --force to delete without confirmation")
                    return
                print("🔥 Force flag detected - proceeding with deletion")

            # Delete entries
            result = collection.delete_many(query)
            print(f"\n✅ Deleted {result.deleted_count} entries from today")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

    finally:
        client.close()
        print("🔌 Disconnected from MongoDB")


if __name__ == "__main__":
    # Check for dry-run flag
    dry_run = "--dry-run" in sys.argv

    delete_todays_songs(dry_run=dry_run)
