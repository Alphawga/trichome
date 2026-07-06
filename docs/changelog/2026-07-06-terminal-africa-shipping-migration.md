# 2026-07-06 — Replace Shipbubble with Terminal Africa for live shipping rates

## What changed

Shipbubble's live rate-quoting had a confirmed, reproducible `"Insufficient wallet balance"` error on `address/validate` — the live path was silently falling back to static per-state rates for every real checkout, with no visible alert. Fully replaced Shipbubble with Terminal Africa's Tship API as the live provider.

- Added `src/lib/shipping/providers/terminal-africa-provider.ts` — single-call live adapter (`POST /rates/shipment/quotes`, embedding sender/receiver address objects directly, no separate address-validation round trip). Sender/warehouse address is built inline from `site-config.ts` on every request — no persisted one-time setup code needed, unlike Shipbubble's `SHIPBUBBLE_SENDER_ADDRESS_CODE`/`SHIPBUBBLE_CATEGORY_ID`.
- Deleted `src/lib/shipping/providers/shipbubble-provider.ts` (225 lines) — fully superseded, no remaining references.
- Rewrote `src/lib/shipping/get-shipping-rate.ts` to gate on `TERMINAL_SECRET_KEY` instead of `SHIPBUBBLE_API_KEY`. The `resolvedState` salvage logic (Shipbubble's address-geocoder echo, used to correct the static fallback's state lookup) was dropped — Terminal Africa's rate response doesn't echo a normalized address, so there's nothing to populate it with. The now-permanently-dead "Shipbubble address check" UI hint was removed from `CheckoutClient.tsx`.
- Rewrote `src/lib/shipping/get-shipping-rate.test.ts`'s live-provider describe block (16/16 tests passing) — replaced the two resolved-state tests with a cheapest-carrier-selection test and minutes-to-days ETA conversion coverage.
- `.env.example`, `CLAUDE.md`'s Shipping section, and the `terminal-africa-shipping` skill (replacing `shipbubble-shipping`) all updated to match.

## Why

The user wanted to keep shipping quotes free and reliable; Shipbubble's account-level wallet-balance requirement made its "free" premise false in practice, and the failure was invisible (silent fallback, no alert). Terminal Africa's published API pricing lists only three metered services (duty calculation, address validation, HS code search) — rate quoting itself isn't one of them.

## Still open / explicitly deferred

- **The account's Terminal Africa KYC is submitted but pending review** — a live test call returned `401: "Complete KYC verification to access the API"` before the exact request-body contract (embedded address objects vs. a separate `POST /addresses` + address-ID reference) could be confirmed. The provider is built against the embedded-object version since two independent doc queries gave consistent field names for it; if the first real call 400s once KYC clears, see the fallback plan documented above `fetchQuotes()` in `terminal-africa-provider.ts`.
- Shipping this now is safe regardless: the existing try/catch-and-fall-back-to-static design means a pending-KYC 401 behaves identically to any other provider failure — same UX as Shipbubble's already-broken state, not a regression. No redeploy will be needed once KYC clears; quotes will start working automatically as long as `TERMINAL_SECRET_KEY` is also set in the production environment (Vercel) — **not yet confirmed done**.
- No DB column distinguishing live vs. static shipping quotes on an `Order` — same pre-existing gap as the Shipbubble integration, not addressed here.
- `computeServerShippingCost`'s address schema (`orders.ts`) still has `phone` as `.optional()` — order creation can still reach the incomplete-destination static fallback if some future caller omits phone.
- No automated test coverage for the real HTTP contract (only mocked-`fetch` unit tests) — same gap the Shipbubble integration had until it was live-verified; requires KYC approval to close.
