//
//  BackgroundSyncManager.swift
//  nvmMusic
//
//  Handles background syncing of listening history when app is closed
//

import Foundation
import BackgroundTasks

class BackgroundSyncManager {
    static let shared = BackgroundSyncManager()

    // Background task identifier
    private let taskIdentifier = "dev.vmello.nvmMusic.sync"

    private init() {}

    /// Register background task handler
    func registerBackgroundTasks() {
        BGTaskScheduler.shared.register(forTaskWithIdentifier: taskIdentifier, using: nil) { task in
            self.handleBackgroundSync(task: task as! BGAppRefreshTask)
        }

        print("📱 Registered background sync task")
    }

    /// Schedule next background sync
    func scheduleBackgroundSync() {
        let request = BGAppRefreshTaskRequest(identifier: taskIdentifier)

        // Schedule sync every 15 minutes when possible
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)

        do {
            try BGTaskScheduler.shared.submit(request)
            print("⏰ Scheduled next background sync")
        } catch {
            print("❌ Could not schedule background sync: \(error.localizedDescription)")
        }
    }

    /// Handle background sync task
    private func handleBackgroundSync(task: BGAppRefreshTask) {
        print("🔄 Background sync task started")

        // Schedule next sync
        scheduleBackgroundSync()

        // Create a task to perform sync with expiration handler
        task.expirationHandler = {
            print("⏰ Background sync time expired")
        }

        // Perform sync
        Task {
            await MusicBackend.shared.performFullHistorySync()
            task.setTaskCompleted(success: true)
        }
    }
}
