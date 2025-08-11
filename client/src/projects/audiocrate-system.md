# AudioCrate - Audio Post-Production Suite

## Description
Comprehensive audio post-production workflow suite in active development, consisting of macOS admin server, iOS controller, and Pro Tools integration. Coordinating with 2 audio engineers as the sole software engineer to build tools that streamline multiple workstations in professional audio environments with real-time control and automation.

## Status
Development

## Type
project

## Tech Stack
- SwiftUI (iOS/macOS)
- PTSL C++ SDK
- gRPC & Protobuf
- Network.framework
- CMake
- TCP Networking
- Bonjour Service Discovery

## Features
- Central server coordinating multiple client workstations
- iPad-based remote controller for workstations
- Direct Pro Tools automation via PTSL SDK
- Automatic network discovery between components
- Multi-workstation project management
- Real-time audio workflow coordination

## Architecture
- macOS Admin App serving as central coordinator
- iOS Controller App for remote workstation control  
- PTSL SDK integration for Pro Tools automation
- TCP networking with Bonjour service discovery

## Icon
fa-solid-music