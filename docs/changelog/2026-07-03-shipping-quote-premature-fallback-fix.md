# 2026-07-03 — Fix checkout silently falling back to static ₦3000 shipping rate

## What changed

Checkout kept quoting a static per-state fallback rate (e.g. ₦3000 for Lagos) instead of a live Shipbubble quote, even with the integration correctly configured. Root cause: `CheckoutClient.tsx`'s `shippingRateQuery` fired as soon as state+city were known, but the live provider requires `addressLine`/`contactName`/`contactEmail`/`contactPhone` too — a missing-field throw was silently caught and replaced with the static rate, with no signal distinguishing it from a real Shipbubble outage.

- `CheckoutClient.tsx` — the debounce (500ms) and the query's `enabled` gate now cover all 4 Shipbubble-required fields, not just state/city. Until they're complete, the UI shows "Complete your name, email, phone number and street address above to see shipping cost" instead of a number. A rate that *does* resolve from the static fallback is now tagged "(estimated)" using the existing but previously-unused `ShippingRate.source` field.
- Added `isShippingQuotePending` — "Continue to Payment" is now disabled while the debounce/query hasn't caught up with the latest typed input, closing a latent payment-mismatch risk: `computeServerShippingCost` recomputes shipping server-side from the just-submitted address at order-creation time, and submitting before the debounced quote settles could send Paystack a stale total.
- `handleSelectSavedAddress` — selecting a saved address no longer blanks a phone/email the customer already typed (the two fields `Address` doesn't reliably carry), while still fully adopting every other field from the selected address (so switching addresses correctly clears fields like `address_2`/`state` the new address doesn't have).
- Added a one-time (ref-guarded) phone auto-fill from `trpc.getProfile` for logged-in users, mirroring the existing first_name/last_name/email session prefill.
- `get-shipping-rate.ts` / `shipbubble-provider.ts` — extracted a single shared `hasCompleteDestinationForLiveQuote()` (in `shipbubble-provider.ts`) so the completeness check has one source of truth instead of being duplicated; an incomplete destination now logs a distinct `console.warn` ("not a Shipbubble outage") instead of the generic operational-failure `console.error`.
- `src/server/modules/shipping.ts` — tightened the `getShippingRate` tRPC input schema's `addressLine`/`contactName`/`contactEmail`/`contactPhone` from optional to required, as a regression guard (confirmed the only caller is `CheckoutClient.tsx`; `computeServerShippingCost` calls the lib function directly and is unaffected).
- Extended `get-shipping-rate.test.ts` with coverage for both new branches (incomplete-destination skip vs. genuine operational failure).

## Why

User reported "the shipment API isn't working anymore. It is still saying 3000 base." Live-tested against the running dev server to confirm the integration itself was healthy (full data → correct live quote) before finding the actual gap in the checkout query's gating logic.

## Review notes

A multi-angle code review of the first-pass fix caught 3 self-introduced bugs before they shipped: a naive "only overwrite truthy fields" fix to the saved-address selector that also stopped state/postal_code/address_2 from ever being cleared when switching addresses (narrowed to just phone/email); a phone-autofill effect that fought a user's manual edit if they cleared the field to retype (fixed with a once-only guard); and a dead-code error-handling branch from duplicating the completeness check in two files (fixed by sharing one function).

## Still open / explicitly deferred

- `computeServerShippingCost`'s own address schema in `orders.ts` still has `phone` as `.optional()` — unlike checkout's now-required gate, order creation can still reach the incomplete-destination fallback if a future caller other than `CheckoutClient.tsx` omits phone. Out of scope for this fix (checkout was the reported symptom).
- `SHIPBUBBLE_API_KEY` rotation is still outstanding (see `project-shipbubble-integration` memory) — unrelated to this fix but flagged again after the investigation agent found it had been echoed into tool output.
