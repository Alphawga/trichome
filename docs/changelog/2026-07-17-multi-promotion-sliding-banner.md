# 2026-07-17 — Multi-promotion sliding site banner

## What changed

The top announcement banner (`header.tsx`) previously showed at most one flagged promotion: `getBannerPromotion` used `findFirst`, so if two or more `Promotion` rows had `show_on_banner: true` and were simultaneously active, only the newest silently won.

- `getBannerPromotion` (`src/server/modules/promotions-storefront.ts`) → `getBannerPromotions` (plural): `findFirst` → `findMany`, returns every active flagged promotion (`id`/`name`/`description`/`code`) instead of one-or-null.
- `header.tsx`: the static "NATURAL BEAUTY, NATURALLY YOURS" tagline is now a permanent first item, followed by one item per active promotion, each separated by `•`. Collapsed the old separate desktop/mobile blocks into one unified row (the mobile-only "swap tagline for promo" behavior is gone — mobile and desktop now show the same content).
- When there are 2+ items, the row scrolls continuously in a seamless infinite loop (new `@keyframes marquee` / `.animate-marquee` in `globals.css`, following the existing `pulse-scale`/`spin-slow` infinite-loop pattern in that file rather than `tailwind.config.js`'s one-shot entrance keyframes) instead of being clipped by `overflow-hidden whitespace-nowrap` as before. Animation duration scales with item count (`max(15, items × 6)`s). With 0 active promotions (1 item, just the tagline) it stays static and centered, unchanged from before.

## Verified

- `pnpm type-check`: zero errors in touched files (remaining repo errors are pre-existing and unrelated — confirmed via targeted grep).
- `pnpm test`: 93/93 passing; no test coverage exists for banner display (none existed before this change either).
- `biome check` on the four touched files: zero new errors — all flagged issues are pre-existing formatting drift outside the lines this diff touches (confirmed by isolating the diff's own line ranges).
- Manually confirmed against a running dev server: `getBannerPromotions` returns the full array (verified 2 simultaneously-active promotions both returned, where the old procedure would have dropped one).
- Ran `/code-review`: found and fixed one real regression before considering this done — the duplicated (looping) copy of the marquee content was `aria-hidden` but its `<Link>`s stayed keyboard-focusable (`aria-hidden` doesn't affect Tab order), so keyboard/screen-reader users could land on an invisible, animating duplicate link. Fixed with React 19's `inert` prop on the duplicate copy, which removes it from both the accessibility tree and the tab order.

## Still open

- **No visual/browser confirmation of the scroll animation or keyboard-focus fix** — no browser/screenshot tooling was available this session; verification was type-check + lint + tests + a direct tRPC call against the running dev server confirming the data layer. The actual scrolling motion, seamlessness of the loop, and the `inert` fix's effect on Tab order have not been eyeballed in a real browser.
- The banner still applies no location scoping (unlike checkout/product-tag promotion resolution) — a promotion restricted to `applicable_state`/`applicable_city` will still show in the banner site-wide. Pre-existing gap, not introduced or fixed by this change; not requested this pass.
