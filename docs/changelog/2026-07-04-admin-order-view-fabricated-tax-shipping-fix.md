# Admin order view: fabricated tax/shipping fix + Shipbubble hygiene

## Problem

Admin's quick-view order sheet (`OrderViewSheet.tsx`, opened from `/admin/orders` list) showed a "Tax (7.5%)" line and a "Shipping" figure that didn't match the database. Investigation traced both to one bug: the sheet never received the order's real `subtotal`/`tax`/`shipping_cost`/`discount` fields — only `total` and line items — so it computed `tax = subtotal * 0.075` locally and back-solved `shipping = total - subtotal - fakeTax`. Tax has been hardcoded to `0` everywhere real (business decision, 2026-07-02); this was a leftover/stale calculation. The full page view at `/admin/orders/[id]` already read the real DB fields correctly.

## Fix

- `src/app/admin/orders/page.tsx`: `AdminOrder` interface and `transformOrder` now carry `subtotal`/`tax`/`shippingCost`/`discount` straight from the Prisma `Order` row (already fetched, just not passed through).
- `src/app/admin/orders/OrderViewSheet.tsx`: matching interface fields added, fabricated local calculation removed, Order Summary block now reads `order.subtotal`/`order.tax`/`order.shippingCost`/`order.total` directly (tax row only renders when `tax > 0`).
- `src/lib/shipping/providers/shipbubble-provider.ts`: removed leftover debug `console.log`s that printed full customer PII (name/email/phone/address) to production logs; fixed `estimatedDays` reading `delivery_eta_time` (a datetime) instead of `delivery_eta` (the "Within X-Y days" string), which had been returning the year (e.g. `2026`) as the day count.

## Verification

`pnpm type-check` and `pnpm lint` clean on the touched files (pre-existing unrelated errors elsewhere untouched). Live-tested the Shipbubble provider directly against a real address — confirmed no debug output and `estimatedDays` returns a sane integer (`9`) instead of a year.
