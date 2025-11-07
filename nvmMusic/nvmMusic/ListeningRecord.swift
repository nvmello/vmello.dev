//
//  ListeningRecord.swift
//  nvmMusic
//
//  Model for music listening history records
//

import Foundation

struct ListeningRecord: Codable {
    let id: String
    let timestamp: Date
    let trackName: String
    let artistName: String
    let albumName: String
    let msPlayed: Double
    let platform: String
    let source: String
    let appleMusicId: String?
    let spotifyUri: String?
    let metadata: [String: String]

    // Rich metadata from Apple Music API
    let albumArtworkUrl: String?
    let genre: String?
    let releaseDate: String?
    let isrc: String?
    let composerName: String?
    let contentRating: String?

    enum CodingKeys: String, CodingKey {
        case id
        case timestamp
        case trackName = "track_name"
        case artistName = "artist_name"
        case albumName = "album_name"
        case msPlayed = "ms_played"
        case platform
        case source
        case appleMusicId = "apple_music_id"
        case spotifyUri = "spotify_uri"
        case metadata
        case albumArtworkUrl = "album_artwork_url"
        case genre
        case releaseDate = "release_date"
        case isrc
        case composerName = "composer_name"
        case contentRating = "content_rating"
    }
}
