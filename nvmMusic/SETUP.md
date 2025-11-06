# nvmMusic - Setup Instructions

## ✅ Files Already Integrated

The following files have been copied into your Xcode project:

- ✅ `Backend.swift` - MusicKit integration and API communication
- ✅ `ListeningRecord.swift` - Data model
- ✅ `ContentView.swift` - SwiftUI interface
- ✅ `nvmMusicApp.swift` - App entry point
- ✅ `Info.plist` - Apple Music permissions

## 📋 Next Steps in Xcode

### 1. Add Files to Xcode Project (if not already added)

If Xcode doesn't show Backend.swift and ListeningRecord.swift in the file navigator:

1. Right-click on `nvmMusic` folder in Xcode
2. Select "Add Files to nvmMusic..."
3. Navigate to `/Users/nickvmorello/Projects/vmello/nvmMusic/nvmMusic/`
4. Select:
   - `Backend.swift`
   - `ListeningRecord.swift`
5. Make sure "Copy items if needed" is **UNCHECKED** (files are already in place)
6. Click "Add"

### 2. Add MusicKit Capability

1. Select the `nvmMusic` project in the navigator
2. Select the `nvmMusic` target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability" button
5. Search for "MusicKit"
6. Double-click to add it

### 3. Update Info.plist (if needed)

The Info.plist should already have the required permission. Verify it contains:

```xml
<key>NSAppleMusicUsageDescription</key>
<string>nvmMusic needs access to Apple Music to track your listening history and sync it to your personal dashboard at vmello.dev</string>
```

If not, add it:
1. Open `Info.plist`
2. Right-click → Add Row
3. Key: `Privacy - Media Library Usage Description`
4. Value: `nvmMusic needs access to Apple Music to track your listening history and sync it to your personal dashboard at vmello.dev`

### 4. Configure Signing

1. Select your project in Xcode
2. Select the `nvmMusic` target
3. Go to "Signing & Capabilities"
4. Select your Team
5. Xcode will automatically create a bundle identifier

### 5. Build and Run

1. Connect your iPhone or select a simulator
2. Press ⌘R or click the Play button
3. The app should build and launch successfully

## 🎵 Using the App

### First Time Setup

1. **Request Authorization**
   - Tap "Request Access" button
   - Grant permission when iOS prompts you

2. **Start Tracking**
   - Tap "Start" button
   - The green dot indicates tracking is active

3. **Play Music**
   - Open Apple Music app
   - Play some tracks
   - Come back to nvmMusic to see them in the queue

4. **Automatic Sync**
   - App automatically syncs immediately when a track is detected
   - No manual intervention needed - tracks appear on website instantly
   - Can also tap "Sync Now" to force sync of any queued items

### Monitoring

- **Now Playing**: Shows current track (if playing)
- **Queue Count**: Number of tracks waiting to sync
- **Last Sync**: Time since last successful sync
- **Pending Sync**: List of up to 5 tracks in queue

## 🔧 Troubleshooting

### Build Errors

**Error: "No such module 'MusicKit'"**
- Solution: Add MusicKit capability (see step 2 above)
- Make sure deployment target is iOS 15.0 or higher

**Error: "Cannot find 'MusicBackend' in scope"**
- Solution: Make sure Backend.swift is added to the project target
- Check that the file is in "Compile Sources" in Build Phases

**Error: "Use of undeclared type 'ListeningRecord'"**
- Solution: Add ListeningRecord.swift to the project
- Check Build Phases → Compile Sources

### Runtime Issues

**Authorization always shows "Denied"**
- Open Settings → Privacy & Security → Media & Apple Music
- Find "nvmMusic" and enable

**Tracks not syncing**
- Check backend server is running: http://localhost:3000 or Railway
- Check Console output for network errors
- Verify API URL in Backend.swift

**No tracks appearing in queue**
- Make sure tracking is started (green dot)
- Open Apple Music and play a track
- Check that Apple Music permission is granted
- Look for errors in Xcode console

## 🌐 Backend Configuration

The app is currently configured to sync to:
```
https://vmellodev-production.up.railway.app/api/listening-history
```

### For Local Testing

1. Make sure backend is running: `npm run dev`
2. Edit `Backend.swift` line 27:
   ```swift
   private let apiURL = "http://localhost:3000/api/listening-history"
   ```
3. If testing on device (not simulator), use your Mac's IP:
   ```swift
   private let apiURL = "http://192.168.0.XXX:3000/api/listening-history"
   ```

## ✨ Features

- ✅ Real-time track detection
- ✅ Play duration tracking (even partial plays)
- ✅ Instant automatic sync when track is detected
- ✅ Background tracking support
- ✅ Offline queue with retry on failure
- ✅ Manual sync button for any queued items
- ✅ Beautiful UI with status indicators
- ✅ Works without opening the app (once tracking is started)

## 📊 Data Flow

```
Apple Music → MusicKit Observer → Instant Sync → Backend API → MongoDB → Website
```

1. You play music in Apple Music
2. nvmMusic detects track changes via MusicKit (every 30 seconds)
3. Tracks duration and creates ListeningRecord
4. Immediately syncs to backend (no waiting)
5. Backend stores in MongoDB `personal_data.listening_history`
6. Backend broadcasts via WebSocket
7. Website updates in real-time
8. Works in background - no need to keep app open

## 🎯 Success Indicators

When everything is working:
- ✅ Authorization status shows "Authorized"
- ✅ Green dot appears when tracking starts
- ✅ "Now Playing" updates when music plays
- ✅ Queue count increases as you listen
- ✅ Queue count drops to 0 after sync
- ✅ "Last Sync" shows recent time
- ✅ Website shows your tracks in marquee

## 🚀 Deployment

### TestFlight

1. Archive app: Product → Archive
2. Upload to App Store Connect
3. Add to TestFlight
4. Invite yourself as tester
5. Install via TestFlight on iPhone

### Production Endpoint

App is already configured for Railway production endpoint. No changes needed for deployment.

---

**Need Help?**
- Check Xcode console for errors
- Check backend logs: Railway console or local terminal
- Check MongoDB: personal_data.listening_history collection
- Check website: http://localhost:5174 or vmello.dev

Happy tracking! 🎵
