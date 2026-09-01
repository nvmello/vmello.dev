# Hue U, AI-Powered Coloring Book Platform

## Description

Full-stack platform (web + native iOS app) that turns photos into coloring pages using AI, live at hueu.ai with the iOS app shipped to the App Store. Directed AI coding agents to architect, implement, test, and ship the entire platform end-to-end (backend, web app, native iOS app, payments, print fulfillment, and production operations), backed by full CI/CD and test coverage throughout.

## Status

Live

## Type

project

## Tech Stack

- Python
- FastAPI
- Next.js
- Swift (iOS)
- Supabase
- Google Gemini
- Stripe
- Google Cloud
- Sentry
- Hermes
- AI Agents

## Features

- AI-powered photo-to-line-art generation
- Book builder with print-on-demand fulfillment and order tracking
- Credit system with Stripe payments on web and StoreKit 2 in-app purchases on iOS
- Native iOS app (SwiftUI) live on the App Store, with a custom flood-fill coloring engine, Apple Pencil pressure support, and anonymous-to-account onboarding
- Production ops in place: Sentry error tracking, transactional and inbound email, Telegram alerting, and a read-only ops dashboard over every live system
- Built an autonomous Hermes agent for production operations: natural-language read access across the stack plus a small, approval-gated set of write actions (credit adjustments, customer emails, issue filing), with a human-in-the-loop approval gate on every write

## Role

Founder

## Links

- **Website**: https://hueu.ai
- **App Store**: https://apps.apple.com/us/app/hue-u/id6779858824

## Icon

fa-solid fa-palette
