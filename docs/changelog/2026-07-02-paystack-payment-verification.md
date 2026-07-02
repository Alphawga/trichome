# 2026-07-02 — Paystack server-side payment verification

## What changed

The Paystack migration (off Monnify) was functionally complete for the happy path but trusted the client to report payment success. Closed the gap and finished the cleanup:

- Added `verifyPaystackTransaction` (`src/lib/webhooks/paystack.ts`) — calls Paystack's `GET /transaction/verify/:reference` server-side using `PAYSTACK_SECRET_KEY`.
- `createOrderWithPayment` and `createGuestOrderWithPayment` (`src/server/modules/orders.ts`) now verify the charge with Paystack before marking an order/payment `COMPLETED`, instead of trusting the client-supplied `paymentStatus`/`amountPaid`.
- `processPaystackPaymentWebhook` now handles `charge.failed` in addition to `charge.success` (previously silently ignored).
- Added `refundPaystackTransaction` and wired it into `processRefund` (`src/server/modules/payments.ts`) so admin-initiated refunds actually call Paystack's refund API instead of only updating the DB.
- Removed stale "Payment response from Monnify" comments in `orders.ts`; pruned `monnify-js` from `pnpm-lock.yaml`; added `.env.example`.

## Why

A client could previously call `createOrderWithPayment`/`createGuestOrderWithPayment` directly with a fabricated `paymentReference` and a hardcoded `paymentStatus: "PAID"` and receive a fulfilled order without an actual Paystack charge — the webhook was a secondary reconciliation path, not the trust boundary.

## Still open

- Migration itself (webhook route, checkout handlers, this fix) is uncommitted on `dev` — needs review and a commit.
- `TESTING_PLAN.md`, `COMPREHENSIVE_TESTING_PLAN.md`, `TODO_IMPLEMENTATION_GUIDE.md` still reference Monnify exclusively, not updated for Paystack.
- No automated test coverage for the payment flow (no test infra exists in the repo yet).
