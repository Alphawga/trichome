# 2026-07-02 — Real shipping-rate API (Shipbubble) + server-side trust fix

## What changed

Shipping cost was a static per-state lookup table, computed entirely client-side, and never re-validated on the server.

- Added a provider-agnostic shipping-rate abstraction (`src/lib/shipping/providers/`): `types.ts`, `static-fallback-provider.ts` (wraps the existing `calculate-shipping.ts` unchanged), and `shipbubble-provider.ts` (live Shipbubble adapter — two calls: `POST /shipping/address/validate` then `POST /shipping/fetch_rates`, 4s timeout each, `rate_card_amount` used as the customer-facing price).
- `src/lib/shipping/get-shipping-rate.ts` — `getShippingRates()` tries the live provider if `SHIPBUBBLE_API_KEY` is set, silently falls back to the static table on any error/timeout/missing key.
- New tRPC procedure `getShippingRate` (`src/server/modules/shipping.ts`, public, own rate limiter in `trpc.ts`) — `CheckoutClient.tsx` now calls this (debounced 500ms) instead of computing shipping in a local `useMemo`.
- **Closed a pre-existing server-trust gap**: `createOrderWithPayment`/`createGuestOrderWithPayment` (`src/server/modules/orders.ts`) previously persisted the client-supplied `totals.shipping` directly to `Order.shipping_cost` with no server-side check — only the final `total` was compared against the Paystack-verified paid amount. Both procedures now call `computeServerShippingCost()`, which recomputes shipping authoritatively server-side and matches the client-reported figure against the two real (standard/express) server rates to recover which method was chosen — without adding a new field through the checkout→payment-handler chain tonight. The Paystack amount-mismatch check now compares against the server-recomputed total, not the client-supplied one.
- Added `jest.config.js` (via `next/jest`) and the repo's first real test file, `src/lib/shipping/get-shipping-rate.test.ts`.
- `.env.example`: `SHIPBUBBLE_API_KEY`, `SHIPBUBBLE_SENDER_ADDRESS_CODE`, `SHIPBUBBLE_CATEGORY_ID`.

## Why

The user wanted real carrier pricing before launch. Building the live carrier call server-side (required to keep the API key off the client) surfaced a bug worth fixing regardless of the carrier: shipping cost was a completely client-trusted number, meaning a client could submit any value (including 0) and only the total was checked against payment — not each component.

## Still open / explicitly deferred

- **Prerequisite one-time Shipbubble setup values are not yet in `.env`**: `SHIPBUBBLE_SENDER_ADDRESS_CODE` (validate the warehouse address once via `POST /shipping/address/validate`) and `SHIPBUBBLE_CATEGORY_ID` (pick one via `GET /shipping/labels/categories`, account-specific — no generic "Cosmetics" category confirmed to exist). Without these, `SHIPBUBBLE_API_KEY` being set will cause every quote to fail and fall back to the static table (safe, but not "live").
- The Shipbubble key provided during this session was a **production** key (`sb_prod_...`) that was pasted into chat and must be rotated before use.
- Real courier tracking (`src/lib/shipping/tracking-service.ts`) is still fully mocked — separate, larger piece of work, not touched.
- No `Product` dimension fields exist; the live adapter uses a fixed generic small-parcel `package_dimension` (20×20×15cm) for every quote.
- No DB column distinguishing live vs. static shipping quotes — logged via `console.error` on fallback, not persisted. Add a column later if this needs querying.
- The legacy `createOrder` procedure (`orders.ts`, hardcoded `shipping_cost = 0`) was left untouched — appears unused by any client code path but wasn't verified/removed.
- The guest-order address-persistence gap (guest orders never create an `Address` row, so destination data isn't queryable after order creation) predates this change and wasn't addressed.
- No automated test coverage for `orders.ts`'s new `computeServerShippingCost` (no existing test infra for that file); only the pure `get-shipping-rate.ts` logic has unit tests.
