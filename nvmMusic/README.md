# nvmMusic - iOS Music Listening Tracker

An iOS app that automatically tracks music listening history from Apple Music and syncs it to the vmello backend for display on the portfolio website.

## Overview

**nvmMusic** is a SwiftUI-based iOS application that integrates with Apple's MusicKit to track your music listening activity across all your devices. It monitors both local playback on the iOS device and cloud-based listening history to capture music played on any Apple Music-connected device.

## Architecture

### Components

- **Backend.swift**: Core business logic handling MusicKit integration and API communication
- **ContentView.swift**: SwiftUI interface for authorization and tracking controls
- **ListeningRecord.swift**: Data model for listening history records

### How It Works

1. **Authorization**: Requests MusicKit authorization to access listening history
2. **Hybrid Tracking**: Monitors both:
   - **Local playback**: `SystemMusicPlayer` for immediate updates on the current device
   - **Cloud history**: `MusicRecentlyPlayedRequest` for cross-device listening
3. **Polling**: Checks for new tracks every 30 seconds
4. **Smart Detection**:
   - Detects track changes and skipped songs
   - Records actual play time vs. track duration
   - Marks tracks as skipped if played < 50% of duration
5. **Automatic Sync**: Posts listening records to backend immediately after detection
6. **Queue Management**: Maintains a local queue for failed syncs with retry capability

## Backend Integration

### Music Listening History

The iOS app connects to your **Railway-hosted backend** to sync music listening data:

**Endpoint**: `https://vmellodev-production.up.railway.app/api/listening-history`

#### API Routes (server/server.js)

- **POST** `/api/listening-history` - Create new listening record
- **GET** `/api/listening-history` - Fetch recent listening history
- **GET** `/api/listening-history/stats` - Get listening statistics

#### WebSocket Updates

The backend broadcasts new tracks via WebSocket to connected clients (your portfolio website), enabling real-time "Now Playing" updates in the marquee component.

**WebSocket URL**: `wss://vmellodev-production.up.railway.app` (or `ws://localhost:3000` for local dev)

### Health/Workout Data Integration

Your iOS Health app workout data connects through a **separate flow**:

**Endpoint**: `https://vmellodev-production.up.railway.app/api/workouts`

#### How Workout Data Flows

1. **iOS Health App** → Exports workout data (via HealthKit or manual sync script)
2. **Migration Script** (`server/scripts/migrateWorkouts.js`) → Imports workouts to MongoDB
3. **Backend API** (`/api/workouts`) → Serves workout data to frontend
4. **WebSocket** → Broadcasts new workouts to connected clients
5. **Frontend Component** (`WorkoutData.jsx`) → Displays today's workouts in marquee

## Database Collections

All data is stored in **MongoDB** under the `personal_data` database:

### `listening_history` Collection

Stores music listening records from the iOS app:

```json
{
  "id": "2025-11-06T17:30:00Z-track-id",
  "timestamp": "2025-11-06T17:30:00Z",
  "track_name": "Song Title",
  "artist_name": "Artist Name",
  "album_name": "Album Name",
  "ms_played": 180000,
  "platform": "ios",
  "source": "apple_music",
  "apple_music_id": "1234567890",
  "spotify_uri": null,
  "metadata": {
    "duration_ms": "180000",
    "skipped": "false"
  }
}
```

### `workouts` Collection

Stores workout/fitness data from iOS Health app:

```json
{
  "_id": "7A19CC58-EE5D-4F78-B58A-A2FEA5991460",
  "type": "Traditional Strength Training",
  "start_date": "2025-08-08T22:10:11Z",
  "end_date": "2025-08-08T22:30:49Z",
  "duration": 20.64,
  "calories": 96.75,
  "timezone": "PDT",
  "timezoneName": "America/Los_Angeles",
  "created_at": "2025-11-06T18:24:55.236Z",
  "updated_at": "2025-11-06T18:24:55.236Z"
}
```

## Railway Deployment Setup

Your backend is deployed on Railway at: `vmellodev-production.up.railway.app`

### Required Environment Variables

Make sure these are configured in your Railway deployment:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://...

# Server Config
PORT=3000
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=https://vmello.dev,https://www.vmello.dev
```

### Endpoints You Need Active on Railway

✅ **Already configured**:
- `/api/listening-history` (POST, GET) - Music tracking
- `/api/workouts` (GET, POST) - Workout data
- WebSocket support on `/` - Real-time updates

### Testing Railway Connection

```bash
# Test music listening endpoint
curl https://vmellodev-production.up.railway.app/api/listening-history

# Test workout endpoint
curl https://vmellodev-production.up.railway.app/api/workouts
```

## Development Setup

### Prerequisites

- Xcode 15+
- iOS 17.0+ device or simulator
- Active Apple Music subscription
- MusicKit API access

### Build & Run

1. Open `nvmMusic.xcodeproj` in Xcode
2. Select your development team in Signing & Capabilities
3. Enable MusicKit capability
4. Build and run on device (Simulator works but with limited features)

### Local Development with Backend

For local development, update the API URL in `Backend.swift`:

```swift
// Switch between production and local
private let apiURL = "http://localhost:3000/api/listening-history"
// private let apiURL = "https://vmellodev-production.up.railway.app/api/listening-history"
```

## Features

### ✅ Implemented

- [x] MusicKit authorization handling
- [x] Hybrid tracking (local + cloud listening)
- [x] Automatic 30-second polling
- [x] Skip detection (< 50% play time)
- [x] Immediate backend sync
- [x] Queue management for failed syncs
- [x] Manual sync/check buttons
- [x] Real-time status display
- [x] Cross-device listening support

### 🚧 Future Enhancements

- [ ] Background tracking (requires Background Modes capability)
- [ ] Offline queue persistence
- [ ] Play count and skip statistics
- [ ] Genre and mood tracking
- [ ] Album artwork caching
- [ ] Spotify integration
- [ ] Historical listening insights

## Frontend Integration

The music data appears on your portfolio website in two places:

1. **NavBar Marquee** (`client/src/components/nav/MusicHistory.jsx`)
   - Displays "Now Playing" or "Recently Played"
   - Shows track name and artist
   - Links to Spotify/Apple Music
   - Updates via WebSocket in real-time

2. **Workout Data** (`client/src/components/nav/WorkoutData.jsx`)
   - Shows today's workouts with icons
   - Displays workout count and types
   - Potato emoji if no workouts today 🥔

Both components are displayed in a smooth scrolling marquee (`SmoothMarquee.jsx`) with color-aware gradients.

## Troubleshooting

### App Not Tracking

1. Check MusicKit authorization status
2. Verify you're playing music in Apple Music app
3. Check console logs for errors
4. Try manual "Check Now" button

### Backend Sync Failing

1. Verify Railway deployment is running
2. Check backend logs in Railway dashboard
3. Test API endpoint with curl
4. Verify MongoDB connection string is valid
5. Check CORS settings allow iOS app origin

### WebSocket Not Updating Frontend

1. Check WebSocket connection in browser console
2. Verify Railway supports WebSocket connections
3. Test with local backend to isolate issue
4. Check frontend WebSocket URL matches backend

## Data Privacy

- All listening data is stored in your private MongoDB database
- Data is only accessible via authenticated API endpoints
- No third-party tracking or analytics
- You control all data retention and deletion

## License

Personal project - All rights reserved

---

**Built with** ❤️ by Nick Morello | [vmello.dev](https://vmello.dev)
