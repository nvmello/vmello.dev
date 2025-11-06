# nvmMusic - Apple Music Listening Tracker

iOS app that tracks your Apple Music listening history and syncs it to your personal dashboard at vmello.dev.

## Features

- **MusicKit Integration**: Tracks Apple Music playback in real-time
- **5-Minute Batch Sync**: Efficiently batches listening events and syncs every 5 minutes
- **Offline Queue**: Stores listening events locally when offline, syncs when connected
- **Beautiful UI**: Clean SwiftUI interface showing current track, queue status, and sync info
- **Privacy Focused**: All data syncs to your personal backend only

## Architecture

### Components

1. **ListeningRecord.swift** - Data model matching backend schema
2. **Backend.swift** - MusicKit integration + API communication
3. **ContentView.swift** - SwiftUI interface
4. **nvmMusicApp.swift** - App entry point

### Data Flow

```
Apple Music Player → MusicKit Observer → Local Queue → 5-Min Timer → Backend API → MongoDB
```

### How It Works

1. **Track Detection**: Observes `ApplicationMusicPlayer` for track changes and playback state
2. **Duration Tracking**: Records how long each track is played (even partial plays)
3. **Queue Management**: Stores listening events in local array
4. **Batch Sync**: Every 5 minutes, POSTs all queued events to backend
5. **Real-time Updates**: Backend broadcasts to website via WebSocket

## Setup Instructions

### 1. Create Xcode Project

```bash
cd /Users/nickvmorello/Projects/vmello/nvmMusic
```

Open Xcode and create new iOS App project:
- **Product Name**: nvmMusic
- **Team**: Your Apple Developer Team
- **Organization Identifier**: com.vmello (or your identifier)
- **Interface**: SwiftUI
- **Language**: Swift
- **Minimum iOS Version**: 15.0

### 2. Add MusicKit Capability

1. Select project in Xcode navigator
2. Select "nvmMusic" target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "MusicKit"

### 3. Add Files to Project

The following files are already created in the `/nvmMusic/` directory:

- `ListeningRecord.swift`
- `Backend.swift`
- `ContentView.swift`
- `nvmMusicApp.swift`
- `Info.plist`

Drag these files into your Xcode project or use "Add Files to nvmMusic..."

### 4. Update Info.plist

The `Info.plist` already contains the required Apple Music usage description:

```xml
<key>NSAppleMusicUsageDescription</key>
<string>nvmMusic needs access to Apple Music to track your listening history and sync it to your personal dashboard at vmello.dev</string>
```

### 5. Backend API Configuration

The app is configured to sync to:
- **Production**: `https://vmellodev-production.up.railway.app/api/listening-history`

To use local development backend, change `apiURL` in `Backend.swift`:

```swift
private let apiURL = "http://localhost:3000/api/listening-history"
```

### 6. Build and Run

1. Connect iPhone or select simulator
2. Build and run (⌘R)
3. Grant Apple Music permission when prompted
4. Tap "Start" to begin tracking
5. Play music in Apple Music app
6. Watch queue fill up and sync every 5 minutes

## Usage

### First Launch

1. **Request Authorization**: Tap "Request Access" to grant Apple Music permission
2. **Start Tracking**: Tap "Start" to begin monitoring playback
3. **Play Music**: Open Apple Music and play some tracks
4. **Automatic Sync**: App syncs every 5 minutes automatically
5. **Manual Sync**: Tap "Sync Now" to force immediate sync

### Monitoring

- **Now Playing**: Shows currently playing track
- **Queue Count**: Number of events waiting to sync
- **Last Sync**: Relative time since last successful sync
- **Pending List**: Preview of up to 5 queued tracks

### Background Tracking

The app continues tracking when:
- App is in background
- Screen is locked
- Device is idle

Requires "Background Modes: Audio" capability (already configured)

## Technical Details

### Listening Event Schema

```swift
{
  "id": "2025-11-06T19:00:00Z-track-id",
  "timestamp": "2025-11-06T19:00:00Z",
  "track_name": "Song Title",
  "artist_name": "Artist Name",
  "album_name": "Album Name",
  "ms_played": 180000,  // 3 minutes in milliseconds
  "platform": "ios",
  "source": "apple_music",
  "apple_music_id": "1234567890",
  "metadata": {
    "genre": "Electronic",
    "duration_ms": "240000",
    "release_date": "2024-01-01"
  }
}
```

### Sync Strategy

- **Frequency**: Every 5 minutes (300 seconds)
- **Retry Logic**: Failed syncs remain in queue for next cycle
- **Duplicate Handling**: Backend uses timestamp+ID for deduplication
- **Network Efficiency**: Batches multiple tracks per API call

### Error Handling

- Network errors: Tracks stay in queue, retry on next sync
- 409 Conflict: Duplicate detected (already synced), remove from queue
- Authorization errors: Show error message, prompt re-authorization

## Integration with vmello.dev

### Backend Endpoints Used

- `POST /api/listening-history` - Creates new listening event
- Backend broadcasts to WebSocket for real-time updates on website

### Website Display

The MusicHistory.jsx component on vmello.dev will show:
- "Now Playing" if track played in last 5 minutes
- "Recently Played" for older tracks
- Links to Apple Music or Spotify

## Troubleshooting

### No Tracks Being Captured

1. Check Apple Music authorization status (should be "Authorized")
2. Ensure tracking is started (green dot)
3. Play music in Apple Music app (not Spotify or other apps)
4. Check Console for debug logs

### Sync Failing

1. Check internet connection
2. Verify backend server is running
3. Check API URL in Backend.swift
4. Look for error messages in UI

### Tracks Not Showing on Website

1. Verify tracks synced (queue count = 0)
2. Check backend logs for POST requests
3. Query MongoDB to verify data exists
4. Check frontend WebSocket connection

## Development Tips

### Testing Locally

1. Run backend server: `npm run dev` in server directory
2. Update `apiURL` to `http://localhost:3000/api/listening-history`
3. Ensure Mac and iPhone on same network
4. Use Mac's local IP address if testing on device

### Debugging

Enable verbose logging by adding print statements:

```swift
print("🎵 Track changed: \(track.title)")
print("📝 Queue size: \(listeningQueue.count)")
print("🔄 Syncing...")
```

### TestFlight Deployment

1. Archive app in Xcode (Product → Archive)
2. Upload to App Store Connect
3. Add to TestFlight
4. Invite beta testers
5. Monitor crash reports and feedback

## Future Enhancements

- [ ] Configurable sync interval (1 min, 5 min, 10 min)
- [ ] Statistics view (daily/weekly/monthly plays)
- [ ] Offline mode indicator
- [ ] Settings screen for API endpoint
- [ ] Widget showing current track
- [ ] Notifications for sync success/failure
- [ ] Export listening data as JSON
- [ ] Integration with Last.fm

## License

Personal project - All rights reserved.

## Support

For issues, check:
- Backend logs: Railway console
- iOS logs: Xcode console
- MongoDB: Check `personal_data.listening_history` collection
- Frontend: Browser DevTools console

---

Built with ❤️ by Nick Morello
Part of the vmello.dev personal dashboard ecosystem
