//
//  Backend.swift
//  nvmMusic
//
//  Handles MusicKit integration and backend API communication
//

import Foundation
import MusicKit
import Combine

class MusicBackend: ObservableObject {
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

    // Backend API configuration
    // Production Railway URL
    private let apiURL = "https://vmellodev-production.up.railway.app/api/listening-history"

    init() {
        checkAuthorizationStatus()

        // Auto-start tracking if already authorized
        if authorizationStatus == .authorized {
            startTracking()
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

    // MARK: - Listening Record Creation

    private func createListeningRecord(song: Song, duration: TimeInterval, skipped: Bool = false) async {
        // Only access properties that are guaranteed to be available to avoid warnings
        // Title, artistName, id, and duration are always populated
        let record = ListeningRecord(
            id: "\(ISO8601DateFormatter().string(from: Date()))-\(song.id.rawValue)",
            timestamp: Date(),
            trackName: song.title,
            artistName: song.artistName,
            albumName: "Unknown Album", // Skip albumTitle to avoid warnings
            msPlayed: duration * 1000, // Convert to milliseconds
            platform: "ios",
            source: "apple_music",
            appleMusicId: song.id.rawValue,
            spotifyUri: nil,
            metadata: [
                "duration_ms": String(Int((song.duration ?? 0) * 1000)),
                "skipped": skipped ? "true" : "false"
            ]
        )

        await MainActor.run {
            listeningQueue.append(record)
            print("📝 Added to queue: \(record.trackName) (\(Int(duration))s)")
        }

        // Sync immediately after adding to queue
        await syncListeningHistory()
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
                await MainActor.run {
                    if let index = listeningQueue.firstIndex(where: { $0.id == record.id }) {
                        listeningQueue.remove(at: index)
                    }
                }
            } catch {
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
            // Duplicate - already exists, not an error
            print("ℹ️  Record already exists (duplicate)")
            return
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
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
