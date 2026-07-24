# 2026-07-24 — Store pickup option + checkout code consolidation

## What changed

Added a store-pickup order option so customers can skip shipping address/cost entirely and collect in-store, plus collapsed the duplicated guest/authenticated checkout frontend code into one implementation.

**New `Store` entity (admin-editable, replaces hardcoded addresses):**
- `Store` model (`prisma/schema.prisma`) — name/address/phone/opening_hours/map_url/is_active/sort_order, no soft-delete, hard delete blocked if the store has linked orders. Migration `20260724103138_add_store_pickup`, applied to the live Supabase DB.
- `src/server/modules/stores.ts` (modeled on `brands.ts`): `getActiveStores` (public, checkout picker), `getStores`/`getStoreById`/`createStore`/`updateStore`/`deleteStore` (staff).
- `stores.create/read/update/delete` added to the `Permission` union, `ALL_PERMISSIONS`, `PERMISSION_DEFINITIONS`, and the `STAFF` role grant list (`src/lib/permissions.ts`).
- Admin CRUD at `src/app/admin/stores/` (list + create/edit sheet + view sheet), sidebar nav entry.
- Seeded the two real branches (Main Branch, Second Store) with their actual Akure addresses.

**Pickup as a first-class delivery method:**
- `Order.delivery_method` (new `DeliveryMethod` enum: `DELIVERY`/`PICKUP`) and `Order.pickup_store_id`.
- `OrderStatus` extended with `READY_FOR_PICKUP`/`PICKED_UP` — every exhaustive `Record<OrderStatus, ...>` map in the codebase (`OrderStatusTimeline.tsx`, `admin/orders/page.tsx`, `admin/orders/[id]/page.tsx`) had to be updated for the two new values.
- `createOrderWithPayment`/`createGuestOrderWithPayment` (`src/server/modules/orders.ts`): address fields relaxed to optional at the Zod level, `.superRefine` enforces address-required-for-delivery / store-required-for-pickup server-side, pickup orders skip Address-row creation and shipping-cost computation entirely (validated against an active `Store`, never trusting a client-picked store name).
- `OrderConfirmationEmailData` gained an optional `pickup` field (`src/lib/email/templates/order-confirmation.ts`) — shows "Pickup Location" instead of "Shipping Address" when applicable.
- `CheckoutClient.tsx`: Delivery/Store Pickup toggle; picking Pickup hides the address form, shows a store picker (name/address/phone/hours), and forces shipping to `0`/"Free" in the order summary. Client-side "address required for delivery" is enforced via a plain computed boolean gating the submit button, not a dynamic zod resolver (avoids react-hook-form resolver-reactivity questions entirely).

**Checkout code consolidation (frontend only — the two backend order-creation mutations stay separate, since authenticated orders link a real `Address` row + track per-user promo usage and guest orders can't):**
- `useOrderCreation.ts` + `useGuestCheckout.ts` → `src/hooks/useCheckoutOrder.ts` (takes `isGuestMode`, branches which tRPC mutation to call).
- `PaymentHandler.tsx` + `GuestPaymentHandler.tsx` → one `usePaymentHandler` hook. Dropped the unused `PaymentHandler` React-component export and the dead `getGuestCartItems`/`isCreatingAccount` exports from the old guest hook (confirmed nothing referenced them).
- Fixed a genuine pre-existing bug found during the merge: a guest order-creation failure used to fire two separate toasts (one from the mutation's own `onError`, a redundant second one from a `useEffect` in `GuestPaymentHandler.tsx` syncing the same error state) — now fires once.
- `CheckoutClient.tsx` now calls one `usePaymentHandler({ isGuestMode, ... })` instead of branching between two separately-instantiated hooks.
- Deliberately **not changed**: the cart page still requires sign-in before reaching checkout — guest-mode UI exists and was exercised in testing via `?guest=true`, but the access policy itself was an explicit user decision to leave alone.

## Verified

- `pnpm type-check`: zero new errors — diffed against the pre-change baseline error set (all pre-existing, unrelated files).
- `pnpm lint` (biome): zero new warnings/errors, same pre-existing set.
- `pnpm test`: 95/95 passing (includes `orders.test.ts`, which covers the mutations this touched).
- Manual browser verification against a local dev server (guest checkout, both delivery methods): store toggle renders and switches correctly, both seeded stores show with correct addresses/phone/hours, selecting one hides the address form and the order summary correctly shows "Free" shipping, submit button correctly gates on name/email/phone + store selection, no console errors, no server errors in the dev log.
- Admin Stores CRUD not yet browser-verified (blocked mid-session by a stale/conflicting NextAuth session cookie across two locally-running projects sharing the `localhost` cookie domain — see `feedback_stale_dev_server_verification.md`).

## Still open

- Admin Stores CRUD (create/edit/deactivate/delete) needs a manual pass with a real admin login — the pages exist and type-check/compile, but haven't been clicked through.
- Authenticated (non-guest) checkout wasn't re-verified in-browser after the Slice 3 merge — same code path, same tests pass, but no separate login-gated click-through was done this session.
- Nothing in this feature has been committed to git yet.
- Pickup orders don't yet trigger a "ready for pickup" customer notification email — the new `READY_FOR_PICKUP` status exists but nothing sends mail when an admin sets it (existing gap for the whole order-status-change email flow, not introduced here — see `project-notifications.md`).
