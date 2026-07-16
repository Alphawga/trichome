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

## `code` is optional (since 2026-07-15) — codeless means auto-apply

`Promotion.code` is `String?` (nullable, still `@unique` — Postgres allows multiple `NULL`s under a unique index). **No code is the "automatic" signal** — there's no separate flag. A codeless `ACTIVE` promotion within its date range and `min_order_value` auto-applies to every eligible cart at checkout with no customer input, found via the public `getAutoApplyPromotion` procedure (`promotions.ts`, mirrors `getBannerPromotion`'s `code: null, status: "ACTIVE", start_date/end_date` query shape, same `orderBy: { created_at: "desc" }` newest-wins tie-break for multiple simultaneously-eligible codeless promos). `CheckoutClient.tsx` calls it alongside `validatePromoCode`; **a manually entered code always overrides an auto-applied one** (no stacking) — a product decision, not a technical constraint, so revisit `activePromo` in `CheckoutClient.tsx` if that priority ever needs to change. `createPromotion`/`updatePromotion` only run the code-uniqueness `findUnique`/`findFirst` check when a code is actually provided; `updatePromotion`'s Zod schema distinguishes omitting `code` (leave unchanged) from sending `code: null` (explicitly clear it back to codeless) via `z.union([z.string()..., z.null()]).optional()`. UI call sites that assume `promotion.code` is always a string (copy-to-clipboard buttons, banner "USE CODE X" text, CSV/table cells) all need a `promotion.code ? ... : <fallback>` guard — `PromotionViewSheet.tsx`, `admin/promotions/page.tsx`, and `header.tsx`'s banner text already do this; check any *new* UI surface that reads `.code` too.

## Eligibility/discount logic lives outside `src/server/modules/` on purpose

`checkPromotionEligibility`/`calculatePromotionDiscount` are **not** in `promotions.ts` — they're in `src/lib/promotions/promotion-eligibility.ts`. This isn't a style choice: every file under `src/server/modules/*.ts` is spread wholesale into the tRPC router via `import * as xModule from "./modules/x"` + `...xModule` in `src/server/index.ts` (see Architecture section of the repo's root CLAUDE.md). A plain exported function (not a `publicProcedure`/`adminProcedure`/etc. chain) inside one of those files gets mistaken for a router entry and **breaks the router's type for the entire app** — every `appRouter.createCaller(...)` call site fails with a cryptic `DecorateRouterRecord<any>` / "This expression is not callable" error, including in unrelated test files. If you need to extract shared business logic (not a procedure) out of a `server/modules/*.ts` file, it must go in `src/lib/`, matching the existing `src/lib/shipping/calculate-shipping.ts`/`src/lib/payments/calculate-paystack-fee.ts` convention — never leave a bare exported helper in a module file that's spread into the router.

## Guest checkout previously silently ignored `promo_code` (fixed 2026-07-15)

`createGuestOrderWithPayment` (`src/server/modules/orders.ts`) accepted a `promo_code` input field and destructured it but never used it anywhere — guest checkout applied zero server-side promotion validation and trusted whatever `totals.discount` the client sent. Fixed by porting in the same promotion-resolution logic `createOrderWithPayment` already had. One deliberate, permanent limitation: `PromotionUsage.user_id` is non-nullable and guest orders have no `user_id`, so `usage_limit_per_user` can never be enforced for guests — only the global `usage_limit` applies (via `Promotion.usage_count` increment, which still happens for guests). Don't try to "fix" this without a schema change to make `PromotionUsage.user_id` nullable, which wasn't in scope for this pass.

## FREE_SHIPPING promotions need the server to actually zero shipping

`computeServerShippingCost` doesn't know about promotions — it always returns the real computed rate. If a `FREE_SHIPPING`-type promotion resolves as eligible, the caller must skip calling it (`isFreeShipping ? 0 : await computeServerShippingCost(...)`) rather than calling it and discarding the result — calling it anyway both wastes an external shipping-rate API call and, if the caller then ignores its result, produces server logic that visually looks like it accounts for shipping but doesn't.
