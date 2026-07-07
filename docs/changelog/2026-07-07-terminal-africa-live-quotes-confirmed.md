# 2026-07-07 — Terminal Africa live shipping quotes confirmed working end-to-end

## What changed

KYC on the Terminal Africa account cleared. Following up on the 2026-07-06 migration (which shipped safely on the static fallback pending KYC), found and fixed two real bugs that were blocking the live path even with KYC approved:

- **`TERMINAL_AFRICA_BASE_URL` sandbox default** — the env var was unset locally, so a production-issued key was hitting `sandbox.terminal.africa` instead of `api.terminal.africa`. Set in local `.env`; **Vercel production still needs the same value added** (not done here, left to the user).
- **Wrong request contract.** `fetchQuotes()` (`src/lib/shipping/providers/terminal-africa-provider.ts`) was built from a contradictory doc summary and sent `address_from`/`address_to`/`packages`/`parcel_total_weight`/`parcel_value`. The real `POST /rates/shipment/quotes` contract (confirmed via the `terminal-africa-tship-documentation` MCP server and a live 200 response) is `pickup_address`/`delivery_address`/a single `parcel` object containing `items` — rewrote the request body to match. `packaging_id` is correctly omitted (only required when `persist_data: true`).
- **`line1` has a 45-character limit** (confirmed via `POST /addresses/validate`) — the real warehouse address in `SITE_ADDRESS.streetAddress` (~130 chars) exceeds it. Added `SITE_ADDRESS.shippingLine1`/`shippingLine2` (`src/lib/site-config.ts`) — same physical address, manually split for carrier use only. `streetAddress` is untouched and still used for the footer/structured-data.

As a side effect of the contract fix, `parcel.items` now carries the cart's per-item manifest (name/value/quantity/weight) — previously omitted entirely, a deferred finding from the 2026-07-06 review.

## Verified

Ran the real `getShippingRates()` code path (not a raw fetch) against a live Nigerian destination: `{ courier: "DHL Express", cost: 5189.75, estimatedDays: 5, source: "live" }` — real carrier, non-round amount, `source: "live"`, confirming the fallback did not fire. `pnpm type-check`, `biome check`, and `pnpm test` (16/16 shipping tests) all pass on the two touched files.

## Findings resolved from the 2026-07-06 code-review deferral list

- Business-name split (`senderAddress()` using "Trichomes"/"Cosmeceuticals" as first/last name) — **left untouched, turned out not to be a problem**. Terminal Africa doesn't reject it the way Shipbubble did.
- Missing `input.items` in the request — fixed as a side effect of the contract rewrite.

## Still open

- Vercel production `TERMINAL_AFRICA_BASE_URL` not yet set — user will do this themselves.
- Cheapest-carrier `.amount` comparison still has no runtime numeric-type check (low priority, confirmed numeric in the one live response seen so far).
- No automated test coverage for the real HTTP contract — existing tests mock `fetch` and don't assert on request-body shape, so a future accidental revert to the old field names wouldn't be caught by `pnpm test`.
