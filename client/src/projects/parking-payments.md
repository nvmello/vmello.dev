# SpotOps, Self-Service Parking Payments

## Description

Self-service prepay parking for a privately owned lot in downtown Indianapolis. Drivers scan a QR code, enter their plate, pick how long to stay, and pay through Stripe; staff triage expired cars from a live dashboard. Built solo for a local business owner, from first ask to a working payment flow on Vercel in under a day. The hard part was the money path: prices are recomputed server-side, a Stripe webhook is the source of truth, and the total is locked at purchase, so there is no exit billing or surprise charges.

## Status

Live

## Type

project

## Tech Stack

- Next.js
- TypeScript
- Supabase
- Stripe
- Resend
- Sentry
- Vercel
- Vitest

## Features

- QR-to-pay flow with Stripe Checkout: scan, enter plate, choose coverage, pay, no app download
- DB-driven pricing engine with owner-editable rates in Postgres, changeable with no redeploy
- Stripe webhook as the source of truth: signature-verified, idempotent, totals recomputed server-side and locked at purchase
- Live staff dashboard with countdowns plus expiry email alerts (Resend and cron)
- Isolated Postgres schema (RLS deny-all, service-role only) with an append-only pricing audit for dispute proof

## Role

Solo Developer

## Icon

fa-solid fa-square-parking
