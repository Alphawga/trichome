# 2026-09-28 — Akure shipping fallback and free-delivery display

## Problem

A customer checking out to Akure saw `Delivery (2 days) (estimated) — ₦5,850`. The `estimated` label confirmed that Terminal Africa had not supplied the rate. The amount was the static Ondo fallback (₦4,500) multiplied by the 1–3 kg factor (1.3).

The provider also defaulted to Terminal Africa's sandbox host whenever `TERMINAL_AFRICA_BASE_URL` was absent. Production uses a live key, so a missing Vercel URL override could make the live request fail and silently activate the static fallback.

The checkout's shipping tile had a separate presentation bug: promotion resolution correctly reduced eligible free delivery to ₦0 on both client and server, but the tile still rendered the underlying quoted rate.

## Changes

- Terminal Africa now defaults to the live `https://api.terminal.africa/v1` host. Sandbox use requires an explicit `TERMINAL_AFRICA_BASE_URL`.
- The static fallback recognizes Akure, Ondo case-insensitively and charges ₦1,500 through 1 kg or ₦2,000 above 1 kg. Other Ondo destinations keep the existing state rate.
- Live Terminal Africa quotes still take precedence over the Akure fallback.
- Checkout now displays `Free delivery promotion applied — Free` when any eligible promotion grants free shipping.
- Added regression coverage for both Akure fallback tiers, non-Akure Ondo rates, live-quote precedence, and server-side free-shipping precedence.

## Operations

Production must still have `TERMINAL_SECRET_KEY` configured. The base URL variable is optional for live operation after this change.
