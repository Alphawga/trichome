# 2026-07-24 — Cart page shows discounts + promo code entry

## What changed

The cart page previously hardcoded `discount={0}` even though checkout, one step later, auto-applies eligible store-wide promotions and shows the savings. Customers couldn't see a discount until checkout, and the cart's "Have a promo code?" link had no handler at all.

- Extracted the promo-code logic that was inline in `CheckoutClient.tsx` into a shared `src/hooks/usePromoCode.ts` (auto-apply query, manual code validate/apply/remove, combined `discount`/`isFreeShipping`) and a shared `src/components/checkout/PromoCodeSection.tsx` (auto-applied promo list + code input/applied chip), so cart and checkout share one implementation instead of duplicating it.
- `usePromoCode` supports `persistOnApply` (cart: writes the applied code to `localStorage` via new `src/utils/local-promo.ts`) and `autoApplyFromStorage` (checkout: reads a persisted code once on mount and re-validates it server-side — same trust-boundary principle as everything else in checkout, a cart-time result is never trusted at order-creation time).
- `applyPromoCode` now uses `trpc.useUtils().validatePromoCode.fetch(...)` (an imperative one-off call) instead of `.refetch()` on a `useQuery` bound to component state — needed so the auto-apply-from-storage path can validate a just-read code immediately, without waiting on a state update to re-render first.
- `CheckoutClient.tsx` refactored to use the shared hook/component (behavior-preserving — same submit-button gating, same discount/shipping derivation).
- `cart/page.tsx`: pulls `user` from `useAuth()` (already exposed `user.id`), computes `total = subtotal - discount`, passes real `discount` into the existing `OrderSummary` (the prop already existed, just wasn't wired up), replaces the dead promo button with `PromoCodeSection`.

## Verified

- `pnpm type-check` / `pnpm lint`: zero new errors vs. baseline.
- `pnpm test`: 95/95 passing.
- Manual browser pass: added a product to cart, confirmed the auto-applied "10% FREE OFF EVERY ORDER" discount (-₦1,000) renders correctly on `/cart` with the total adjusted, matching what checkout already showed. Verified with a temporary test promotion code (created and deleted via a one-off script, not committed) that manual code entry works on cart.

## Still open

- Carry-over to checkout (apply on cart → auto-validated on checkout without re-typing) is implemented but the end-to-end persistence flow across the two pages wasn't independently re-confirmed after the last manual test round in this session — worth a deliberate click-through (apply on cart, navigate to checkout, confirm same code + discount, no re-entry) before considering this fully done.
- Nothing in this feature has been committed to git yet.
