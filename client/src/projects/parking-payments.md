# SpotOps, Self-Service Parking Payments

## Description

Self-service prepay parking for a privately owned lot in downtown Indianapolis, built solo and in production with the owner. Drivers scan a QR code, enter their plate, pick how long to stay, and pay through Stripe, with no app to download. Staff work from a live dashboard that shows who is paid up and who has expired. The money path is the part I was most careful with: a Stripe webhook is the source of truth, prices are recomputed on the server, and the total is locked at purchase, so a driver is never billed more than they agreed to.

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
