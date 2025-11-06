//
//  ContentView.swift
//  nvmMusic
//
//  Created by Nick Morello on 11/6/25.
//

import SwiftUI
import MusicKit

struct ContentView: View {
    @StateObject private var backend = MusicBackend()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "music.note.list")
                            .font(.system(size: 60))
                            .foregroundColor(.green)

                        Text("nvmMusic")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("Apple Music Listening Tracker")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 32)

                    // Authorization Status
                    VStack(spacing: 16) {
                        HStack {
                            Image(systemName: authorizationIcon)
                                .foregroundColor(authorizationColor)
                            Text("Authorization: \(authorizationStatusText)")
                                .font(.headline)
                            Spacer()
                        }

                        if backend.authorizationStatus != .authorized {
                            Button(action: {
                                Task {
                                    await backend.requestAuthorization()
                                }
                            }) {
                                Label("Request Access", systemImage: "lock.open")
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // Tracking Status
                    if backend.authorizationStatus == .authorized {
                        VStack(spacing: 16) {
                            HStack {
                                Circle()
                                    .fill(backend.isTracking ? Color.green : Color.gray)
                                    .frame(width: 12, height: 12)

                                Text(backend.isTracking ? "Tracking Active" : "Tracking Inactive")
                                    .font(.headline)

                                Spacer()

                                Button(backend.isTracking ? "Stop" : "Start") {
                                    if backend.isTracking {
                                        backend.stopTracking()
                                    } else {
                                        backend.startTracking()
                                    }
                                }
                                .buttonStyle(.bordered)
                            }

                            Divider()

                            // Current Track
                            if let track = backend.currentTrack {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Now Playing")
                                        .font(.caption)
                                        .foregroundColor(.secondary)

                                    Text(track.title)
                                        .font(.headline)

                                    Text(track.artistName)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            } else {
                                Text("No track playing")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)

                        // Queue Info
                        VStack(spacing: 16) {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("Queue")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Text("\(backend.listeningQueue.count)")
                                        .font(.title)
                                        .fontWeight(.bold)
                                }
                                Spacer()
                                VStack(alignment: .trailing) {
                                    Text("Last Sync")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Text(lastSyncText)
                                        .font(.subheadline)
                                }
                            }

                            Button(action: {
                                backend.forceSyncNow()
                            }) {
                                Label("Sync Now", systemImage: "arrow.clockwise")
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                            .disabled(backend.listeningQueue.isEmpty)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)

                        // Queue List
                        if !backend.listeningQueue.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Pending Sync")
                                    .font(.headline)
                                    .padding(.horizontal)

                                ForEach(backend.listeningQueue.prefix(5), id: \.id) { record in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(record.trackName)
                                                .font(.subheadline)
                                                .lineLimit(1)
                                            Text(record.artistName)
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                                .lineLimit(1)
                                        }
                                        Spacer()
                                        Text("\(Int(record.msPlayed / 1000))s")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    .padding(.horizontal)
                                    .padding(.vertical, 8)
                                    .background(Color(.systemGray6))
                                    .cornerRadius(8)
                                }
                                .padding(.horizontal)

                                if backend.listeningQueue.count > 5 {
                                    Text("+ \(backend.listeningQueue.count - 5) more")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                        .padding(.horizontal)
                                }
                            }
                        }
                    }

                    // Error Message
                    if let error = backend.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding()
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(8)
                    }

                    Spacer()
                }
                .padding()
            }
            .navigationBarHidden(true)
        }
    }

    // MARK: - Helper Properties

    private var authorizationStatusText: String {
        switch backend.authorizationStatus {
        case .notDetermined:
            return "Not Requested"
        case .denied:
            return "Denied"
        case .restricted:
            return "Restricted"
        case .authorized:
            return "Authorized"
        @unknown default:
            return "Unknown"
        }
    }

    private var authorizationIcon: String {
        switch backend.authorizationStatus {
        case .authorized:
            return "checkmark.circle.fill"
        case .denied, .restricted:
            return "xmark.circle.fill"
        default:
            return "questionmark.circle.fill"
        }
    }

    private var authorizationColor: Color {
        switch backend.authorizationStatus {
        case .authorized:
            return .green
        case .denied, .restricted:
            return .red
        default:
            return .gray
        }
    }

    private var lastSyncText: String {
        guard let lastSync = backend.lastSyncTime else {
            return "Never"
        }

        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: lastSync, relativeTo: Date())
    }
}

#Preview {
    ContentView()
}
