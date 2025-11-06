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
    @Published var currentTrack: Track?
    @Published var isTracking = false
    @Published var listeningQueue: [ListeningRecord] = []
    @Published var lastSyncTime: Date?
    @Published var errorMessage: String?

    private var musicPlayer = ApplicationMusicPlayer.shared
    private var cancellables = Set<AnyCancellable>()
    private var syncTimer: Timer?
    private var trackStartTime: Date?

    // Backend API configuration
    private let apiURL = "https://vmellodev-production.up.railway.app/api/listening-history"

    init() {
        checkAuthorizationStatus()
        observePlayerState()
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

        // Start 5-minute sync timer
        syncTimer = Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { [weak self] _ in
            Task {
                await self?.syncListeningHistory()
            }
        }

        print("🎵 Music tracking started")
    }

    func stopTracking() {
        isTracking = false
        syncTimer?.invalidate()
        syncTimer = nil
        print("🎵 Music tracking stopped")
    }

    // MARK: - Player State Observation

    private func observePlayerState() {
        // Observe current entry changes
        musicPlayer.queue.objectWillChange
            .sink { [weak self] _ in
                Task {
                    await self?.handleTrackChange()
                }
            }
            .store(in: &cancellables)

        // Observe playback state
        musicPlayer.state.objectWillChange
            .sink { [weak self] _ in
                Task {
                    await self?.handlePlaybackStateChange()
                }
            }
            .store(in: &cancellables)
    }

    private func handleTrackChange() async {
        guard isTracking else { return }

        // Save previous track if exists
        if let previousTrack = currentTrack, let startTime = trackStartTime {
            let playDuration = Date().timeIntervalSince(startTime)
            await createListeningRecord(track: previousTrack, duration: playDuration)
        }

        // Update to new track
        if let entry = musicPlayer.queue.currentEntry,
           case .song(let track) = entry.item {
            await MainActor.run {
                currentTrack = track
                trackStartTime = Date()
            }
            print("🎵 Now playing: \(track.title) - \(track.artistName)")
        }
    }

    private func handlePlaybackStateChange() async {
        guard isTracking else { return }

        let state = musicPlayer.state.playbackStatus

        if state == .stopped || state == .paused {
            // Save current track listening time
            if let track = currentTrack, let startTime = trackStartTime {
                let playDuration = Date().timeIntervalSince(startTime)
                await createListeningRecord(track: track, duration: playDuration)

                await MainActor.run {
                    currentTrack = nil
                    trackStartTime = nil
                }
            }
        }
    }

    // MARK: - Listening Record Creation

    private func createListeningRecord(track: Track, duration: TimeInterval) async {
        let record = ListeningRecord(
            id: "\(ISO8601DateFormatter().string(from: Date()))-\(track.id.rawValue)",
            timestamp: Date(),
            trackName: track.title,
            artistName: track.artistName,
            albumName: track.albumTitle ?? "Unknown Album",
            msPlayed: duration * 1000, // Convert to milliseconds
            platform: "ios",
            source: "apple_music",
            appleMusicId: track.id.rawValue,
            spotifyUri: nil,
            metadata: [
                "genre": track.genreNames.first ?? "Unknown",
                "duration_ms": String(Int((track.duration ?? 0) * 1000)),
                "release_date": track.releaseDate?.description ?? "Unknown"
            ]
        )

        await MainActor.run {
            listeningQueue.append(record)
            print("📝 Added to queue: \(record.trackName) (\(Int(duration))s played)")
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

        let (data, response) = try await URLSession.shared.data(for: request)

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
}
