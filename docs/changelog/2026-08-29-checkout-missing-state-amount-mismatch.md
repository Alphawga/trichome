# 2026-08-29 — "Payment amount mismatch" after debit (missing state → free-shipping fallback)

## Context

A customer (Instagram DM, 13:17 WAT) was debited ₦14,624.65 by Paystack via OPay, then saw
`Failed to create order — Payment amount mismatch. Expected: 19699.65, Received: 14624.65`
and never got an order. The initial theory was two people checking out at the same time
clashing; the DB record rules that out — a real collision throws
`"This payment is already being finalized"`, is keyed on a single payment reference (so two
different customers can never collide), and the nearest other checkout attempt was two days
earlier.

The real cause, from `CheckoutAttempt` `TRICHOMES-1788005818499-4D5B50EA`
(`2026-08-29T12:16:58Z`, `RECOVERY_FAILED`):

```
address: { city: "Akure", address_1: "...", country: "NG", ... }   ← no `state`
totals:  { subtotal: 15900, discount: 1590, shipping: 0, total: 14624.65 }
```

`state` was empty, which split the client and server totals:

- **Client**: the shipping-rate query is gated on `hasCompleteShippingContactDetails`, which
  requires a state, so it never ran. `shipping` then fell back to `selectedRate?.cost ?? 0` —
  **"no quote" silently rendered as "Free"**. The shipping panel was hidden entirely (its
  render guard required `formData.city && formData.state`), so there was no visible warning.
  Charged: 15,900 − 1,590 + **0** = 14,310, + ₦314.65 fee = **₦14,624.65**.
- **Server**: `computeServerShippingCost` passed `state: ""` to the static table, which
  returned the `default: 5000` rate. 15,900 − 1,590 + **5,000** = 19,310, + ₦389.65 fee =
  **₦19,699.65** — the expected figure in the error.

Nothing gated the pay button on a state: it's `.optional()` in the checkout resolver,
`deliveryAddressComplete` only checked `address_1 && city`, and the State `<label>` had no
required marker while City did. The webhook recovery path then re-ran the same deterministic
code and failed identically → `RECOVERY_FAILED`.

The ₦30,000-within-Akure free-shipping promotion wouldn't have covered her either (₦15,900
subtotal); only the codeless 10% promo applied, identically on both sides.

## What changed

- `src/app/(customer)/checkout/CheckoutClient.tsx`:
  - New `hasShippingQuote` (`PICKUP || isFreeShipping || Boolean(selectedRate)`) added to the
    submit button's `disabled` set, with a `"Shipping cost required"` label. A delivery order
    can no longer be charged off a `?? 0` shipping fallback — this covers both a quote that
    never ran (incomplete address) and one that errored (`shippingRateQuery.isError`
    previously left the button live at ₦0 too).
  - `deliveryAddressComplete` now requires `formData.state`.
  - State label gained the `*` required marker City already had.
  - The shipping panel renders for every delivery order instead of only when city+state are
    filled, so a missing field shows the "complete your … city and state" hint rather than
    hiding the whole section. Hint text now names city and state.
- `src/server/modules/orders.ts`: `prepareCheckout` / `prepareGuestCheckout` now take
  `validatedPreparedCheckoutSchema` — `preparedCheckoutSchema` plus a `superRefine` that
  requires `address_1`, `city` and `state` on `DELIVERY` orders (`PICKUP` unaffected).
  Preparation runs *before* the Paystack popup opens, so this is the last point where a bad
  address can be rejected without the customer being charged.
- `src/server/modules/orders.test.ts`: three tests — `prepareCheckout` and
  `prepareGuestCheckout` both reject a stateless delivery address without persisting an
  attempt, and a `PICKUP` checkout with no delivery address still succeeds.

## Not changed (deliberate, next slice)

The amount charged is still client-computed: `prepareCheckout` only persists the payload and
returns a reference, and `PaymentHandler.tsx:113` initializes Paystack with
`props.totals.total * 100`, while order creation recomputes everything server-side. Any
client/server divergence therefore still means "money taken, order refused". The structural
fix is to have `prepareCheckout` recompute subtotal/discount/shipping/fee with the same
helpers order creation uses and return the authoritative `amount` for the popup — deferred to
its own slice since it touches the highest-risk path in the app.

## Customer remedy (done)

Honoured via admin **Create Order + mark paid**: `ORD-1788007615615-GXN3CZXX2`, created
`2026-08-29T12:46:55Z`, total ₦14,624.65 with shipping ₦0 and the ₦1,590 discount, payment
`COMPLETED` against the original reference `TRICHOMES-1788005818499-4D5B50EA` (so the Payment
row now matches what the webhook reconciles on). `adminCreateOrder` sends the customer's order
confirmation email itself, fire-and-forget, after the transaction commits — no separate step
was needed. Note there is no way to re-send that email if Resend dropped it: the only
`sendOrderConfirmationEmail` caller outside order creation is `settings.ts`'s test-email
sender, which mails a dummy order to the admin's own address.

## Verification

`pnpm test` 101 passing (was 98). `pnpm type-check` reports the same 27 pre-existing errors as
before the change (`consultations.ts`, `settings.ts`, `mock-data.ts`) — none in the touched
files. `biome check` is clean on both server files; `CheckoutClient.tsx`'s findings are
byte-identical to the pre-change baseline (verified against `git show HEAD:` — no broad
formatter run). `git diff --stat`: 111 insertions, 8 deletions across 3 files. Not yet
verified in the browser — worth one manual pass: start a delivery checkout without picking a
state and confirm the button reads "Shipping cost required" and stays disabled.
