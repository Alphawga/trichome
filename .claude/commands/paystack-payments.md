# Paystack Payments Reference

Use this skill when touching checkout, order creation with payment, the Paystack webhook, or refunds — `src/server/modules/orders.ts` (payment mutations), `src/server/modules/payments.ts`, `src/lib/webhooks/paystack.ts`, `src/app/api/webhooks/paystack/`, `src/components/checkout/{PaymentHandler,GuestPaymentHandler}.tsx`.

## Trust boundary (the one rule that matters)

**Never trust client-reported payment status.** The Paystack inline popup runs client-side; its `callback` payload is attacker-controlled. `createOrderWithPayment` / `createGuestOrderWithPayment` (`src/server/modules/orders.ts`) call `verifyPaystackTransaction(reference)` (`src/lib/webhooks/paystack.ts`) — a server-side `GET /transaction/verify/:reference` using `PAYSTACK_SECRET_KEY` — and use *that* result's `status`/`amount`, not the client's `paymentResponse.paymentStatus`/`amountPaid`. If you add another payment-completing mutation, it must do the same verify call before marking anything `COMPLETED`. The webhook (`processPaystackPaymentWebhook`) is a secondary reconciliation path, not the trust anchor — it fires after the order-creation mutation already ran.

## Amounts

Paystack amounts are always in **kobo** (amount × 100) on the wire — verify responses, webhook payloads, and refund calls all use kobo. Convert to naira (`/100`) only at the boundary where you compare against `Order.total`/`Payment.amount` (which are naira `Decimal`).

## Reference field is the reconciliation key

`Payment.reference` (nullable, unique) is set to the client-generated `paymentReference` at order-creation time and is what the webhook uses to look up the `Payment` row (`prisma.payment.findUnique({ where: { reference } })`). If a payment-creating code path doesn't set `reference` to the same value used when initializing/verifying the Paystack transaction, the webhook can't find the row.

## Webhook event coverage

`processPaystackPaymentWebhook` handles `charge.success` and `charge.failed` (both map through `mapPaystackStatus`). Other event types (`refund.processed`, `transfer.*`, `invoice.*`, `subscription.*`) are explicitly ignored — if you need to react to one, add it to the event guard at the top of the function, don't assume it's silently handled.

## Refunds

`processRefund` (`src/server/modules/payments.ts`) calls `refundPaystackTransaction` (`src/lib/webhooks/paystack.ts`) — Paystack's `POST /refund` — before updating `Payment`/`Order` status, and only when `payment.payment_method === "PAYSTACK"` (other `PaymentMethod` values are DB-only, no external gateway call). `payment.reference` is nullable — guard for it before calling the refund API.

## Idempotency caveat

The webhook's duplicate-delivery guard is a simple status check (`payment.status === "COMPLETED" && status === "success"`), not an event-id ledger. A retried webhook after a transient failure can still double-write `OrderStatusHistory`. Known limitation, not yet fixed — see `docs/changelog/2026-07-02-paystack-payment-verification.md`.

## Processing fee (added 2026-07-15) — the charged amount is fee-inclusive

Paystack's transaction fee is passed through to the customer, not absorbed. `calculatePaystackFee(amount)` (`src/lib/payments/calculate-paystack-fee.ts`) is a pure function — 1.5% + ₦100 flat, the ₦100 waived below ₦2,500, capped at ₦2,000 total — used identically client- and server-side (safe to import client-side, no secrets). `Order.processing_fee` (`Decimal`, default `0`) persists it; `Order.total`/`Payment.amount` are now **fee-inclusive** (`subtotal + shipping + tax - discount + fee`), a semantic change from before this date. It's recomputed server-side (never trusted from the client) at every real Paystack-verification site: `createOrderWithPayment`, `createGuestOrderWithPayment`, and `adminCreateOrder`'s `payment.mode === "verify"` branch only (the manual/offline branch has no gateway involved, so `processing_fee: 0` there). `OrderSummary.tsx` and every order-detail view (`OrderConfirmationClient.tsx`, `order-history/[id]/page.tsx`, `admin/orders/OrderViewSheet.tsx`, `admin/orders/[id]/page.tsx`, `CreateOrderSheet.tsx`) show a "Payment processing fee" line, itemized (not folded silently into Total).

## Testing checkout procedures — the rate limiter bypasses `ctx.prisma`

`checkoutRateLimited`/`guestCheckoutRateLimited` (`src/server/trpc.ts`) call `checkRateLimit()` (`src/lib/rate-limit.ts`), which uses a **module-level `prisma` singleton import**, not `ctx.prisma` — a mocked `ctx.prisma` in a test does **not** intercept it. Any test exercising `createOrderWithPayment`/`createGuestOrderWithPayment` must `jest.mock("@/lib/rate-limit", () => ({ checkRateLimit: jest.fn().mockResolvedValue({ allowed: true }) }))` or the test silently hits the real (often production) database. Same applies to `getShippingRates` (`src/lib/shipping/get-shipping-rate.ts`) if you don't want shipping-cost assertions coupled to the real state-rate table — mock it to a fixed `[{ cost: 0 }]` and let `get-shipping-rate.test.ts` own that logic's own coverage.

## Current gaps (as of 2026-07-15)

- No `.env.example`-documented onboarding beyond the two Paystack vars (now added).
- Testing/planning docs (`TESTING_PLAN.md`, `COMPREHENSIVE_TESTING_PLAN.md`, `TODO_IMPLEMENTATION_GUIDE.md`) still reference Monnify exclusively — not updated for Paystack.
- Test coverage now exists (`jest.config.js`, `src/server/modules/orders.test.ts`, `src/lib/payments/calculate-paystack-fee.test.ts`) — CLAUDE.md's "no test files" note is stale, don't trust it.
