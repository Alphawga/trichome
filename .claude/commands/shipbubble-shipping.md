# Shipbubble Shipping Reference

Use this skill when touching shipping-rate quoting, checkout shipping method selection, or the Shipbubble adapter — `src/lib/shipping/get-shipping-rate.ts`, `src/lib/shipping/providers/*`, `src/server/modules/shipping.ts`, the shipping-related sections of `src/server/modules/orders.ts` (`computeServerShippingCost`), `src/app/(customer)/checkout/CheckoutClient.tsx`.

## Architecture (fallback-first by design)

`getShippingRates()` (`src/lib/shipping/get-shipping-rate.ts`) is the single entry point, called both by the checkout-quote tRPC procedure and by order creation. It tries the live Shipbubble adapter only if `SHIPBUBBLE_API_KEY` is set, and **silently falls back** to the static per-state table (`src/lib/shipping/calculate-shipping.ts`, unmodified) on any error, timeout, or missing key. If shipping numbers ever look wrong or suspiciously "static," check whether the live path is even configured before assuming a bug in the adapter.

## Never trust client-reported shipping cost (the trust boundary)

Same pattern as Paystack payment verification (see `paystack-payments` skill): `createOrderWithPayment`/`createGuestOrderWithPayment` (`src/server/modules/orders.ts`) do **not** persist the client-supplied `totals.shipping`. They call `computeServerShippingCost()`, which recomputes shipping authoritatively server-side and matches the client-reported figure against the two real (standard/express) server rates to infer which method was chosen — there is no explicit `shipping_method` field threaded through the checkout → payment-handler → order-creation chain, by design, to avoid that plumbing under time pressure. If a fraudulent/zeroed client value doesn't match either real rate, it falls back to the cheaper one, which correctly fails the subsequent Paystack amount-mismatch check (compared against the server-recomputed total, not the client's).

## Shipbubble API contract (confirmed against their live docs, not assumed)

- **Auth**: `Authorization: Bearer <SHIPBUBBLE_API_KEY>`. Key prefix tells the mode: `sb_sandbox_...` (test) vs `sb_prod_...` (live, real wallet debits). Never hardcode a key literal — `edit-check.sh` flags `"sb_prod_..."`/`"sb_sandbox_..."` string literals same as it does Paystack keys.
- **A quote is two sequential calls, not one**:
  1. `POST /v1/shipping/address/validate` — body `{ name, email, phone, address }` (free-text address string; `latitude`/`longitude` optional and take priority if given). Returns a normalized `address_code` (number) plus normalized city/state/postal/lat-lon. Required for **both** sender and receiver — there's no way to pass a raw address straight into the rate endpoint.
  2. `POST /v1/shipping/fetch_rates` — body needs `sender_address_code`, `reciever_address_code` (Shipbubble's own spelling, not a typo to fix), `pickup_date` (`yyyy-mm-dd`), `category_id`, `package_items` (`{ name, description, unit_weight, unit_amount, quantity }[]`), `package_dimension` (`{ length, width, height }` cm — **required**, no default in their API). Optional `service_type` (`dropoff`/`pickup`).
- **Response**: `data.couriers[]`, each with `courier_name`, `total` (wallet-debit amount if booked), **`rate_card_amount`** (the customer-facing price — use this one, not `total`), `pickup_eta_time`/`delivery_eta_time`. Also `data.fastest_courier`/`data.cheapest_courier` shortcuts and a `request_token` (valid 7 days, only needed if booking a shipment later — not used yet, quoting only).
- **`category_id` and the sender `address_code` are one-time, account-specific setup values**, not computed at request time: `category_id` comes from `GET /v1/shipping/labels/categories` (merchant-specific list, no guaranteed generic "Cosmetics" entry — examples seen: Accessories, Electronics, Jewelry, Food, Fashion wears), and the sender `address_code` comes from validating the warehouse address once. Both live in `.env` as `SHIPBUBBLE_CATEGORY_ID`/`SHIPBUBBLE_SENDER_ADDRESS_CODE` — if either is missing/wrong, every live quote fails and silently falls back to static (check these before assuming a code bug).

## Known gaps (as of 2026-07-02)

- `Product` has no L/W/H dimension fields — `shipbubble-provider.ts` uses a fixed generic small-parcel `package_dimension` (20×20×15cm) for every quote, regardless of actual product size.
- No DB column distinguishes live vs. static-fallback shipping quotes on an `Order` — only logged via `console.error` on fallback. Add a column if this needs querying/auditing later.
- Standard/express UI mapping is `cheapest_courier` → "standard", `fastest_courier` → "express" — Shipbubble doesn't have a native standard/express concept, this is our own mapping to preserve the existing checkout UI.
- No automated tests cover the live Shipbubble adapter or `computeServerShippingCost` (only the pure static-fallback path has Jest coverage, in `get-shipping-rate.test.ts` — the repo's first test file).
- See `docs/changelog/2026-07-02-shipbubble-shipping-integration.md` and the `project-shipbubble-integration` memory for full session history and what was still blocked (key rotation, missing setup env vars) at the end of the launch-night build.
