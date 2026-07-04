# Analytics pipeline rebuild + revenue/top-products accuracy fixes

## Problem

The admin `/admin/analytics` dashboard always rendered empty/zero data regardless of real store activity. Root cause: it read exclusively from a Prisma `Analytics` table that nothing in the codebase ever wrote to — the only writer (`recordAnalytics`) was never called, no tracking beacon/cron/webhook existed. It was a scaffolded feature (model + procedures + UI) whose "record" side was never built.

The same investigation surfaced three more live, real bugs sharing the same root-cause class as the earlier OrderViewSheet fabricated-tax fix (duplicated ad-hoc aggregation instead of one source of truth):
1. Revenue aggregates (`getOrderStats`, `getUserStats`) counted paid-then-cancelled/returned/refunded orders as revenue forever, since `cancelOrder`/`updateOrderStatus` never flip `payment_status` off `COMPLETED`.
2. `getTopProducts` fetched `take(limit)` products *before* ranking by units sold — real best-sellers outside that arbitrary slice never appeared.
3. A dead duplicate `getDashboardStats` in `analytics.ts` was silently shadowed by `dashboard.ts`'s export of the same name.

## Fix

- **Retired the orphaned `Analytics` model**, added `VisitorDailyStat` (`prisma/schema.prisma`) — one row per `(visitor_id, date)`, upserted via raw SQL (same `ON CONFLICT` idiom as `src/lib/rate-limit.ts`).
- New anonymous `trichome_vid` cookie identifies visitors; `PageViewTracker.tsx` (mounted in `providers.tsx`) fires a `trackPageView` mutation on every non-admin route change. Rate-limited by IP (`pageViewRateLimited` in `src/server/trpc.ts`) and fails open on transient DB errors, matching this repo's existing public-write conventions.
- Orders/revenue/conversion-rate are computed **live** from `Order` at read time (`src/lib/analytics/aggregate.ts`) — no cron infra introduced.
- New `src/lib/analytics/revenue.ts`: `getRevenueTotal()` / `REVENUE_WHERE` is the single correctly-filtered revenue helper (excludes `CANCELLED`/`RETURNED`/`REFUNDED` order status), now used by `getOrderStats` (orders.ts), `getUserStats` (users.ts), and `getTopProducts`' sales ranking (dashboard.ts) — closing the "cancelled orders inflate revenue" bug everywhere it existed.
- `getTopProducts` (dashboard.ts) rewritten to rank via `orderItem.groupBy` before fetching product rows, and now excludes items from cancelled/returned/refunded orders.
- Fixed `getUserStats`' `avgOrderValue`, which divided filtered revenue by an unfiltered order count (mismatched populations).
- Deleted dead code: `analytics.ts`'s shadowed `getDashboardStats`/unused `recordAnalytics`, and `getAnalyticsSchema`/`recordAnalyticsSchema` in `dto.ts` (never imported by anything).
- Parallelized previously-sequential count/revenue queries in `getOrderStats`/`getUserStats` via `Promise.all`.
- Swapped hand-rolled `₦{n.toLocaleString()}` in `admin/analytics/page.tsx` for the existing `formatCurrency()` helper.

## Known limitations (flagged, not fixed this pass)

- Visitor/page-view day-bucketing uses UTC calendar days; this is a Nigeria-only (Africa/Lagos, UTC+1) store, so traffic near local midnight can be bucketed into the wrong day. Needs a store-wide timezone-anchoring decision.
- `getTopProducts`' `take(limit * 2)` headroom (to skip inactive products) can under-fill results if more than half the top sellers by volume are discontinued.
- `aggregate.ts` sums revenue via JS floating-point addition rather than a DB-side Decimal sum; low real-world impact at this store's order volume.

## Verification

`pnpm type-check`, `pnpm lint`, `pnpm test` (20 tests, including new `revenue.test.ts` and `aggregate.test.ts`) all clean. Live-verified end-to-end against the dev DB: fired `trackPageView` via curl, confirmed `visitor_daily_stats` rows are created and increment correctly on repeat calls; confirmed rate-limiting/error-handling wrap didn't break the happy path. Migration (`20260704151311_analytics_visitor_tracking`) applied to local dev DB, dropping the empty `analytics` table and creating `visitor_daily_stats`.
