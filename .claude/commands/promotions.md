# Promotions Reference

Use this skill when touching admin promotions/discounts (`src/app/admin/promotions/`), the `Promotion`/`PromotionUsage` models, `src/server/modules/promotions.ts`, or the site's top announcement banner (`src/components/layout/header.tsx`).

## No cron — status is self-healed lazily on read

There is no job scheduler anywhere in this app. `Promotion.status` (`ACTIVE`/`INACTIVE`/`SCHEDULED`/`EXPIRED`) does not transition on its own just because a date passed — a `SCHEDULED` promo whose `start_date` arrives, or an `ACTIVE` promo whose `end_date` passes, stays in that stale status forever unless something touches it. `syncPromotionStatuses()` in `src/server/modules/promotions.ts` fixes this: it runs two `updateMany` calls (`SCHEDULED`→`ACTIVE` where `start_date <= now`, `ACTIVE`→`EXPIRED` where `end_date < now`) and is called at the top of every read procedure (`getPromotions`, `getPromotionById`, `getPromotionStats`, `getBannerPromotion`). **If you add a new read path over `Promotion`, call `syncPromotionStatuses(ctx.prisma)` at the top of it too** — the DB is never migrated to a correct state, it's repaired on the next read.

## Promotions are store-wide — no product/category scoping

The `Promotion` model has no `product_ids`/`category_ids` field. Discounts apply to the whole cart, gated only by `min_order_value`, `target_customers` (`ALL`/`NEW_CUSTOMERS`/`VIP`/`SPECIFIC_GROUP`), and usage limits. If a task asks for "20% off skincare products only," that requires a schema change, not just a new promotion row.

## `validatePromoCode` re-checks dates independently of `status`

`validatePromoCode` (`promotions.ts`, public procedure used at checkout) checks `promotion.status !== "ACTIVE"` **and separately** checks `now < start_date || now > end_date`. This means even before the `syncPromotionStatuses` fix existed, a stale `ACTIVE` promo past its `end_date` could never actually be applied at checkout — the status bug was a display/admin-UX problem (misleading `SCHEDULED` promos, wrong-looking stats), not a way to get an expired discount to apply.

## Site banner is driven by a single flag, not a general CMS

`Header` (`src/components/layout/header.tsx`, client component) queries the public `getBannerPromotion` tRPC procedure, which returns the single most-recent `Promotion` matching `show_on_banner: true && status === "ACTIVE" && start_date <= now <= end_date`, or `null`. When present, its `name`/`description`/`code` replace the second banner span (desktop + mobile); when absent, the original hardcoded "FREE SHIPPING OVER ₦30,000 FOR ANYWHERE WITHIN AKURE" text renders as fallback. There's no rotation across multiple flagged promotions — if two are flagged simultaneously, only the newest (`created_at desc`) shows. There is still no generic reusable banner/announcement-bar component in this codebase; this is the only DB-driven text in that slot.

## The Akure ₦30,000 fallback and the real shipping threshold can drift

The banner's fallback text and the actual free-shipping calculation (`AKURE_FREE_SHIPPING_THRESHOLD` in `src/lib/shipping/calculate-shipping.ts`) are two independently hardcoded ₦30,000 constants with no shared source of truth. Changing one doesn't change the other — pre-existing gap, not addressed by the banner work.

## Admin form conventions

`PromotionFormSheet.tsx` uses `react-hook-form` with `reset()` for all three modes (edit/template-prefill/blank-create) — any new field needs a default in all three `reset()` calls or it'll be `undefined` on some paths. Boolean fields use a plain `<input type="checkbox" {...register("field")} />`, matching the pattern in `ProductFormSheet.tsx` (no dedicated Checkbox/Switch UI component exists in `src/components/ui/`). The file was split into `PromotionFormSheet.tsx` + `PromotionDiscountFields.tsx` on 2026-07-07 to stay under this repo's ~600-line convention — put new discount-type-specific fields in the latter, schedule/targeting/banner fields in the former.
