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
    @Published var isTracking = false
    @Published var listeningQueue: [ListeningRecord] = []
    @Published var lastSyncTime: Date?
    @Published var errorMessage: String?
    @Published var lastCheckTime: Date?

    private var pollingTimer: Timer?
    private var syncTimer: Timer?
    private var lastProcessedTrackID: String?

    // Backend API configuration
    private let apiURL = "https://vmellodev-production.up.railway.app/api/listening-history"

    init() {
        checkAuthorizationStatus()
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

        // Sync to backend every 5 minutes
        syncTimer = Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { [weak self] _ in
            Task {
                await self?.syncListeningHistory()
            }
        }

        // Do initial check immediately
        Task {
            await checkRecentlyPlayed()
        }

        print("🎵 Music tracking started - polling every 30 seconds")
    }

    func stopTracking() {
        isTracking = false
        pollingTimer?.invalidate()
        pollingTimer = nil
        syncTimer?.invalidate()
        syncTimer = nil
        print("🎵 Music tracking stopped")
    }

    // MARK: - Recently Played Tracking

    private func checkRecentlyPlayed() async {
        guard isTracking else { return }

        do {
            // Fetch recently played tracks
            let request = MusicRecentlyPlayedRequest<Song>()
            let response = try await request.response()

            await MainActor.run {
                lastCheckTime = Date()
            }

            // Get the most recent track
            if let latestSong = response.items.first {
                // Check if this is a new track (different from last processed)
                let trackID = latestSong.id.rawValue

                if trackID != lastProcessedTrackID {
                    print("🎵 New track detected: \(latestSong.title) - \(latestSong.artistName)")

                    await MainActor.run {
                        currentTrack = latestSong
                        lastProcessedTrackID = trackID
                    }

                    // Create listening record
                    // Note: We don't have exact play duration, so we'll estimate based on song length
                    let estimatedDuration = latestSong.duration ?? 180.0 // Default 3 minutes
                    await createListeningRecord(song: latestSong, duration: estimatedDuration)
                }
            }
        } catch {
            print("❌ Error fetching recently played: \(error.localizedDescription)")
            await MainActor.run {
                errorMessage = "Failed to fetch recent tracks: \(error.localizedDescription)"
            }
        }
    }

    // MARK: - Listening Record Creation

    private func createListeningRecord(song: Song, duration: TimeInterval) async {
        let record = ListeningRecord(
            id: "\(ISO8601DateFormatter().string(from: Date()))-\(song.id.rawValue)",
            timestamp: Date(),
            trackName: song.title,
            artistName: song.artistName,
            albumName: song.albumTitle ?? "Unknown Album",
            msPlayed: duration * 1000, // Convert to milliseconds
            platform: "ios",
            source: "apple_music",
            appleMusicId: song.id.rawValue,
            spotifyUri: nil,
            metadata: [
                "genre": song.genreNames.first ?? "Unknown",
                "duration_ms": String(Int((song.duration ?? 0) * 1000)),
                "release_date": song.releaseDate?.description ?? "Unknown"
            ]
        )

        await MainActor.run {
            listeningQueue.append(record)
            print("📝 Added to queue: \(record.trackName) (\(Int(duration))s)")
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
