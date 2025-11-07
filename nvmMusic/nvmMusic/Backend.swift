//
//  Backend.swift
//  nvmMusic
//
//  Handles MusicKit integration and backend API communication
//

import Foundation
import MusicKit
import Combine

enum SyncError: Error {
    case duplicate
    case serverError(Int)
}

class MusicBackend: ObservableObject {
    // Singleton instance for background task access
    static let shared = MusicBackend()

    @Published var authorizationStatus: MusicAuthorization.Status = .notDetermined
    @Published var currentTrack: Song?
    @Published var isTracking = true
    @Published var listeningQueue: [ListeningRecord] = []
    @Published var lastSyncTime: Date?
    @Published var errorMessage: String?
    @Published var lastCheckTime: Date?

    private var pollingTimer: Timer?
    private var lastProcessedTrackID: String?
    private var trackStartTime: Date?
    private var lastPlaybackPosition: TimeInterval = 0
    private var lastFullSyncTime: Date?
    private var recentlySyncedSongIDs: [String] = []  // Last 30 synced song IDs

    // Backend API configuration
    // Production Railway URL
    private let apiURL = "https://vmellodev-production.up.railway.app/api/listening-history"

    private init() {
        checkAuthorizationStatus()
        loadLastSyncTime()

        // Auto-start tracking if already authorized
        if authorizationStatus == .authorized {
            startTracking()

            // Perform initial full sync to backfill history
            Task {
                await performFullHistorySync()
            }
        }
    }

    // MARK: - Persistence

    /// Load last sync time and recently synced songs from UserDefaults
    private func loadLastSyncTime() {
        lastFullSyncTime = UserDefaults.standard.object(forKey: "lastFullSyncTime") as? Date
        if let lastSync = lastFullSyncTime {
            print("📅 Last full sync: \(lastSync)")
        }

        if let savedSongIDs = UserDefaults.standard.array(forKey: "recentlySyncedSongIDs") as? [String] {
            recentlySyncedSongIDs = savedSongIDs
            print("📥 Loaded \(recentlySyncedSongIDs.count) recently synced song IDs")
        }
    }

    /// Save last sync time and recently synced songs to UserDefaults
    private func saveLastSyncTime() {
        UserDefaults.standard.set(Date(), forKey: "lastFullSyncTime")
        UserDefaults.standard.set(recentlySyncedSongIDs, forKey: "recentlySyncedSongIDs")
    }

    /// Track a song as recently synced (keeps only last 30)
    private func trackRecentlySyncedSong(_ songID: String) {
        recentlySyncedSongIDs.append(songID)
        // Keep only last 30
        if recentlySyncedSongIDs.count > 30 {
            recentlySyncedSongIDs.removeFirst(recentlySyncedSongIDs.count - 30)
        }
    }

    // MARK: - Authorization

    func checkAuthorizationStatus() {
        authorizationStatus = MusicAuthorization.currentStatus
    }

    func requestAuthorization() async {
        let status = await MusicAuthorization.request()
        await MainActor.run {
            authorizationStatus = status
            if status == .authorized {
                startTracking()
            }
        }
    }

    // MARK: - Music Tracking

    func startTracking() {
        guard authorizationStatus == .authorized else {
            errorMessage = "Music access not authorized"
            return
        }

        isTracking = true

        // Poll for recently played tracks every 30 seconds
        pollingTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
            Task {
                await self?.checkRecentlyPlayed()
            }
        }

        // Allow timer to run in background
        if let timer = pollingTimer {
            RunLoop.current.add(timer, forMode: .common)
        }

        // Do initial check immediately
        Task {
            await checkRecentlyPlayed()
        }

        print("🎵 Music tracking started - polling every 30 seconds, syncing immediately")
    }

    func stopTracking() {
        isTracking = false
        pollingTimer?.invalidate()
        pollingTimer = nil
        print("🎵 Music tracking stopped")
    }

    // MARK: - Full History Sync

    /// Performs a full sync of listening history from Apple Music
    /// Fetches all recently played tracks and lets the SERVER handle duplicate detection
    func performFullHistorySync() async {
        guard authorizationStatus == .authorized else {
            print("⚠️  Cannot sync history - not authorized")
            return
        }

        print("🔄 Starting full history sync...")

        do {
            // Fetch as many recently played tracks as possible
            // MusicRecentlyPlayedRequest limit is typically 30
            var request = MusicRecentlyPlayedRequest<Song>()
            request.limit = 30  // Maximum allowed by Apple Music API
            let response = try await request.response()

            print("📊 Found \(response.items.count) recently played tracks")

            var newTracksCount = 0
            var duplicateCount = 0

            // Process each track from oldest to newest (reverse order)
            // NOTE: We don't have actual listen timestamps from MusicRecentlyPlayedRequest
            // Simple deduplication: skip songs we've synced in the last 30 tracks
            for song in response.items.reversed() {
                let songID = song.id.rawValue

                // Skip if we synced this song in the last 30 tracks
                if recentlySyncedSongIDs.contains(songID) {
                    print("⏭️  Skipping recently synced: \(song.title)")
                    duplicateCount += 1
                    continue
                }

                // Create a listening record for this historical track
                // Use current timestamp since we don't know the actual listen time
                let duration = song.duration ?? 180.0

                print("📝 Syncing historical track: \(song.title) - \(song.artistName)")

                // Attempt to create record - server may also reject if duplicate
                let wasCreated = await createListeningRecordWithDuplicateCheck(
                    song: song,
                    duration: duration,
                    skipped: false
                )

                if wasCreated {
                    newTracksCount += 1
                    // Track this song ID to avoid re-syncing in next batch
                    trackRecentlySyncedSong(songID)
                } else {
                    duplicateCount += 1
                }

                // Small delay to avoid overwhelming the server
                try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
            }

            // Save last sync time
            saveLastSyncTime()

            await MainActor.run {
                lastFullSyncTime = Date()
            }

            print("✅ Full sync complete - New: \(newTracksCount), Duplicates: \(duplicateCount)")

        } catch {
            print("❌ Error during full history sync: \(error.localizedDescription)")
            await MainActor.run {
                errorMessage = "History sync failed: \(error.localizedDescription)"
            }
        }
    }

    // MARK: - Recently Played Tracking

    private func checkRecentlyPlayed() async {
        guard isTracking else { return }

        do {
            await MainActor.run {
                lastCheckTime = Date()
            }

            // HYBRID APPROACH: Check both local player (instant) and cloud (cross-device)

            // 1. Check SystemMusicPlayer for THIS device (immediate updates)
            let musicPlayer = SystemMusicPlayer.shared
            var localTrack: Song?

            if musicPlayer.state.playbackStatus == .playing,
               let currentEntry = musicPlayer.queue.currentEntry {
                switch currentEntry.item {
                case .song(let song):
                    localTrack = song
                default:
                    break
                }
            }

            // 2. Check MusicRecentlyPlayedRequest for ALL devices (includes other devices)
            var request = MusicRecentlyPlayedRequest<Song>()
            request.limit = 10
            let response = try await request.response()
            let cloudTrack = response.items.first

            // 3. Use whichever track is most relevant
            // Priority: local playing track > most recent cloud track
            let recentTrack = localTrack ?? cloudTrack

            guard let recentTrack = recentTrack else {
                print("ℹ️  No tracks found")
                return
            }

            let trackID = recentTrack.id.rawValue
            let isNewTrack = trackID != lastProcessedTrackID

            if isNewTrack {
                // Finalize previous track if exists
                if let previousTrackID = lastProcessedTrackID,
                   let startTime = trackStartTime,
                   let prevTrack = currentTrack {
                    let actualPlayTime = Date().timeIntervalSince(startTime)
                    let trackDuration = prevTrack.duration ?? 180.0
                    let wasSkipped = actualPlayTime < (trackDuration * 0.5)

                    print("⏭️  Previous track ended - Played: \(Int(actualPlayTime))s of \(Int(trackDuration))s - Skipped: \(wasSkipped)")
                    await createListeningRecord(song: prevTrack, duration: actualPlayTime, skipped: wasSkipped)
                }

                // Use track as-is without loading extra details to avoid warnings
                let source = localTrack != nil ? "(Local)" : "(Cloud)"
                print("🎵 New track detected \(source): \(recentTrack.title) - \(recentTrack.artistName)")

                await MainActor.run {
                    currentTrack = recentTrack
                    lastProcessedTrackID = trackID
                    trackStartTime = Date()
                }
            }
        } catch {
            print("❌ Error checking recently played: \(error.localizedDescription)")
            await MainActor.run {
                errorMessage = "Failed to check recently played: \(error.localizedDescription)"
            }
        }
    }

    // MARK: - Detailed Song Information

    /// Fetches complete song metadata from Apple Music API
    /// Returns enriched metadata including album, genre, artwork, artist ID, etc.
    private func fetchDetailedSongInfo(songID: MusicItemID) async -> (albumName: String, albumArtworkUrl: String?, genre: String?, releaseDate: String?, isrc: String?, composerName: String?, contentRating: String?, artistId: String?)? {
        do {
            // Create a request for the specific song with artist relationships
            var request = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: songID)
            let response = try await request.response()

            guard var detailedSong = response.items.first else {
                print("⚠️  Could not fetch detailed song info for ID: \(songID.rawValue)")
                return nil
            }

            // Extract album information
            let albumName = detailedSong.albumTitle ?? "Unknown Album"

            // Extract artwork URL (300x300 size for good quality)
            let albumArtworkUrl = detailedSong.artwork?.url(width: 300, height: 300)?.absoluteString

            // Extract genre (first genre if multiple)
            let genre = detailedSong.genreNames.first

            // Extract release date
            let releaseDate: String?
            if let releaseD = detailedSong.releaseDate {
                let formatter = ISO8601DateFormatter()
                formatter.formatOptions = [.withFullDate]
                releaseDate = formatter.string(from: releaseD)
            } else {
                releaseDate = nil
            }

            // Extract ISRC
            let isrc = detailedSong.isrc

            // Extract composer name
            let composerName = detailedSong.composerName

            // Extract content rating (explicit/clean)
            let contentRating: String?
            if let rating = detailedSong.contentRating {
                contentRating = rating == .explicit ? "explicit" : "clean"
            } else {
                contentRating = nil
            }

            // Extract artist ID - need to explicitly load the artists relationship
            var artistId: String?
            do {
                // Load the artists relationship data
                detailedSong = try await detailedSong.with([.artists])
                artistId = detailedSong.artists?.first?.id.rawValue
                print("🎤 Artist ID extracted: \(artistId ?? "none")")
            } catch {
                print("⚠️  Could not load artist relationship: \(error.localizedDescription)")
                artistId = nil
            }

            print("✅ Fetched detailed info: \(detailedSong.title) - Album: \(albumName) - Artist ID: \(artistId ?? "none")")

            return (albumName, albumArtworkUrl, genre, releaseDate, isrc, composerName, contentRating, artistId)

        } catch {
            print("❌ Error fetching detailed song info: \(error.localizedDescription)")
            return nil
        }
    }

    // MARK: - Listening Record Creation

    private func createListeningRecord(song: Song, duration: TimeInterval, skipped: Bool = false) async {
        // Fetch detailed song information from Apple Music API
        let detailedInfo = await fetchDetailedSongInfo(songID: song.id)

        // Use enriched metadata if available, fallback to basic data
        let albumName = detailedInfo?.albumName ?? "Unknown Album"
        let albumArtworkUrl = detailedInfo?.albumArtworkUrl
        let genre = detailedInfo?.genre
        let releaseDate = detailedInfo?.releaseDate
        let isrc = detailedInfo?.isrc
        let composerName = detailedInfo?.composerName
        let contentRating = detailedInfo?.contentRating
        let artistId = detailedInfo?.artistId

        let record = ListeningRecord(
            id: song.id.rawValue,  // Use Apple Music song ID directly
            timestamp: Date(),
            trackName: song.title,
            artistName: song.artistName,
            albumName: albumName,
            msPlayed: duration * 1000, // Convert to milliseconds
            platform: "ios",
            source: "apple_music",
            appleMusicId: song.id.rawValue,
            appleMusicArtistId: artistId,
            spotifyUri: nil,
            metadata: [
                "duration_ms": String(Int((song.duration ?? 0) * 1000)),
                "skipped": skipped ? "true" : "false"
            ],
            albumArtworkUrl: albumArtworkUrl,
            genre: genre,
            releaseDate: releaseDate,
            isrc: isrc,
            composerName: composerName,
            contentRating: contentRating
        )

        await MainActor.run {
            listeningQueue.append(record)
            print("📝 Added to queue: \(record.trackName) (\(Int(duration))s)")
        }

        // Track this song as recently synced
        trackRecentlySyncedSong(song.id.rawValue)
        saveLastSyncTime()

        // Sync immediately after adding to queue
        await syncListeningHistory()
    }

    /// Creates a listening record with duplicate detection from server response
    /// Returns true if record was created, false if it was a duplicate
    private func createListeningRecordWithDuplicateCheck(song: Song, duration: TimeInterval, skipped: Bool = false) async -> Bool {
        // Fetch detailed song information from Apple Music API
        let detailedInfo = await fetchDetailedSongInfo(songID: song.id)

        // Use enriched metadata if available, fallback to basic data
        let albumName = detailedInfo?.albumName ?? "Unknown Album"
        let albumArtworkUrl = detailedInfo?.albumArtworkUrl
        let genre = detailedInfo?.genre
        let releaseDate = detailedInfo?.releaseDate
        let isrc = detailedInfo?.isrc
        let composerName = detailedInfo?.composerName
        let contentRating = detailedInfo?.contentRating
        let artistId = detailedInfo?.artistId

        let record = ListeningRecord(
            id: song.id.rawValue,  // Use Apple Music song ID directly
            timestamp: Date(),
            trackName: song.title,
            artistName: song.artistName,
            albumName: albumName,
            msPlayed: duration * 1000, // Convert to milliseconds
            platform: "ios",
            source: "apple_music",
            appleMusicId: song.id.rawValue,
            appleMusicArtistId: artistId,
            spotifyUri: nil,
            metadata: [
                "duration_ms": String(Int((song.duration ?? 0) * 1000)),
                "skipped": skipped ? "true" : "false"
            ],
            albumArtworkUrl: albumArtworkUrl,
            genre: genre,
            releaseDate: releaseDate,
            isrc: isrc,
            composerName: composerName,
            contentRating: contentRating
        )

        // Try to post directly to server (don't queue it)
        do {
            try await postListeningRecord(record)
            return true
        } catch SyncError.duplicate {
            // Server says this record already exists
            print("ℹ️  Duplicate detected by server: \(record.trackName)")
            return false
        } catch {
            print("❌ Failed to post record: \(error.localizedDescription)")
            return false
        }
    }

    // MARK: - Backend Sync

    func syncListeningHistory() async {
        guard !listeningQueue.isEmpty else {
            print("ℹ️  No listening records to sync")
            return
        }

        print("🔄 Syncing \(listeningQueue.count) listening records...")

        let recordsToSync = listeningQueue

        for record in recordsToSync {
            do {
                try await postListeningRecord(record)
                // Successfully synced - remove from queue
                await MainActor.run {
                    if let index = listeningQueue.firstIndex(where: { $0.id == record.id }) {
                        listeningQueue.remove(at: index)
                    }
                }
            } catch SyncError.duplicate {
                // Duplicate - remove from queue since it's already in database
                print("ℹ️  Duplicate skipped: \(record.trackName)")
                await MainActor.run {
                    if let index = listeningQueue.firstIndex(where: { $0.id == record.id }) {
                        listeningQueue.remove(at: index)
                    }
                }
            } catch {
                // Real error - keep in queue and try again later
                print("❌ Failed to sync record: \(error.localizedDescription)")
                await MainActor.run {
                    errorMessage = "Sync failed: \(error.localizedDescription)"
                }
            }
        }

        await MainActor.run {
            lastSyncTime = Date()
            print("✅ Sync completed at \(ISO8601DateFormatter().string(from: Date()))")
        }
    }

    private func postListeningRecord(_ record: ListeningRecord) async throws {
        guard let url = URL(string: apiURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(record)

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        if httpResponse.statusCode == 409 {
            // Duplicate - already exists
            throw SyncError.duplicate
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw SyncError.serverError(httpResponse.statusCode)
        }

        print("✅ Posted: \(record.trackName)")
    }

    // MARK: - Manual Sync

    func forceSyncNow() {
        Task {
            await syncListeningHistory()
        }
    }

    func forceCheckNow() {
        Task {
            await checkRecentlyPlayed()
        }
    }
}
