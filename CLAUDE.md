# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                # Start dev server (Next.js, App Router)
pnpm build               # Production build
pnpm lint                # Biome check
pnpm lint:fix            # Biome check --write
pnpm format              # Biome format --write
pnpm type-check           # tsc --noEmit

pnpm db:generate          # Regenerate Prisma client after schema changes
pnpm db:migrate           # Create + apply a dev migration
pnpm db:push              # Push schema without a migration (prototyping only)
pnpm db:studio            # Prisma Studio

pnpm test                 # Jest (unit)
pnpm test -- path/to/file.test.ts   # Single test file
pnpm test:e2e              # Playwright
```

Note: `test` and `test:e2e` scripts exist but there are currently no test files or Jest/Playwright config files in the repo — `pnpm test` will report "No tests found."

Package manager is **pnpm** (see `pnpm-lock.yaml`, `packageManager` overrides in `package.json`). Don't use npm/yarn.

Linting/formatting is **Biome**, not ESLint/Prettier — `biome.json` at root.

## Architecture

Next.js 16 App Router e-commerce app for Trichomes Cosmeceuticals. Postgres via Prisma, tRPC for the API layer, NextAuth for auth, Cloudinary for images, Paystack for payments.

### Route groups

- `src/app/(customer)/*` — storefront (products, cart, checkout, account, wishlist, etc.)
- `src/app/admin/*` — admin dashboard (products, orders, customers, promotions, settings, permissions, analytics)
- `src/app/auth/*` — sign in/up, password reset
- `src/app/api/*` — the tRPC catch-all route, NextAuth route, Cloudinary upload route, and payment webhooks (only these need to be plain REST handlers; everything else goes through tRPC)

### tRPC API

Single router assembled by spreading per-domain modules, not a nested namespace tree:

```
src/server/trpc.ts          — t.router/procedure + publicProcedure/protectedProcedure/adminProcedure/staffProcedure
src/server/context.ts       — creates { prisma, session } per request
src/server/index.ts         — appRouter = router({ ...authModule, ...productsModule, ... })
src/server/modules/*.ts     — one file per domain, each exports named procedures (getProducts, createOrder, etc.)
src/app/api/trpc/[...trpc]/route.ts — fetch adapter binding appRouter to Next.js
```

To add an endpoint: add a named export (a `publicProcedure`/`protectedProcedure`/`staffProcedure`/`adminProcedure` chain) to the relevant `src/server/modules/*.ts` file and spread that module's export in `src/server/index.ts` (already spread if the module exists — you just add the export). Client access is via `trpc` from `src/utils/trpc.ts` (typed off `AppRouter`), wired up in `src/components/providers.tsx` with `httpBatchLink` + superjson.

Procedure tiers in `src/server/trpc.ts`:
- `publicProcedure` — no auth
- `protectedProcedure` — requires session, exposes `ctx.user`
- `staffProcedure` — requires role `STAFF` or `ADMIN`
- `adminProcedure` — requires role `ADMIN`

### Auth & permissions

- NextAuth (`src/lib/auth.ts`) with `PrismaAdapter`, Google OAuth + credentials (bcrypt via `src/lib/auth/password.ts`). Session/JWT are extended with `role`, `first_name`, `last_name`.
- Role is coarse (`UserRole`: `ADMIN` / `STAFF` / `CUSTOMER`), enforced in tRPC via `staffProcedure`/`adminProcedure`.
- Finer-grained permissions are a separate string-based system: `src/lib/permissions.ts` defines the `Permission` union (e.g. `"products.update"`, `"orders.delete"`) and `UserPermission` rows in Prisma grant specific permissions to specific users, independent of role. Check both when working on admin access control.

### Data model (Prisma, `prisma/schema.prisma`)

25 models, `snake_case` columns mapped via `@map`/`@@map` to camelCase Prisma fields. Core domains: `User`/`Address`/`UserPermission`, `Product`/`ProductVariant`/`ProductImage`/`Category`/`Brand`, `CartItem`/`WishlistItem`, `Order`/`OrderItem`/`OrderStatusHistory`/`Payment`, `Promotion`/`PromotionUsage`, `Consultation`, `Review`, `Content`, `SystemSetting`, `Analytics`, NextAuth's `Account`/`Session`/`VerificationToken`.

Status/lifecycle enums to know: `OrderStatus`, `PaymentStatus`, `PaymentMethod` (`PAYSTACK`/`FLUTTERWAVE`/`BANK_TRANSFER`/`USSD`/`WALLET` — only Paystack is actually wired up), `ProductStatus`, `ReviewStatus`, `ConsultationStatus`, `PromotionStatus`.

### Cart: guest + authenticated merge

Cart has two storage paths that must stay reconciled:
- Guest/anonymous cart lives in `localStorage` (`src/utils/local-cart.ts`, `LocalCartItem`).
- Authenticated cart lives in `CartItem` rows in Postgres, via `cartModule` tRPC procedures.
- `src/lib/cart/sync-cart.ts` merges the two on login (max quantity wins on conflicts, localStorage items get pushed to DB, then localStorage is cleared) — used by `src/hooks/useCartSync.ts`.
- `src/hooks/useGuestCheckout.ts` / `src/hooks/useOrderCreation.ts` handle checkout for both guest and authenticated flows; guest orders are looked up post-purchase by order number + email.

### Payments

Paystack is the live payment provider (migrated off Monnify — see `src/lib/webhooks/paystack.ts`, `src/app/api/webhooks/paystack/`, `src/types/paystack.d.ts`). Webhook signature is verified with HMAC-SHA512 over the raw payload using the Paystack secret key before any `Order`/`Payment` status mutation. `createOrderWithPayment`/`createGuestOrderWithPayment` (`src/server/modules/orders.ts`) call `verifyPaystackTransaction` server-side before trusting a charge as paid — never trust `paymentStatus`/`amountPaid` reported by the client. Amounts from Paystack are in kobo.

### Shipping

Shipping cost is computed server-side through `getShippingRates()` (`src/lib/shipping/get-shipping-rate.ts`), exposed via the `getShippingRate` tRPC procedure (`src/server/modules/shipping.ts`). It tries the live `terminal-africa-provider.ts` (single call to `POST /rates/shipment/quotes`, aggregating multiple carriers) if `TERMINAL_SECRET_KEY` is set, and silently falls back to the static per-state NGN rate table (`STATE_SHIPPING_COSTS` in `src/lib/shipping/calculate-shipping.ts`, plus a ₦20,000 Akure-only free-shipping threshold) on any error, timeout, or missing key. `CheckoutClient.tsx` calls the tRPC procedure (debounced) for the live quote shown to the customer; `orders.ts`'s `createOrderWithPayment`/`createGuestOrderWithPayment` independently recompute shipping server-side via the same function and never trust the client-reported `totals.shipping` — see `computeServerShippingCost` in `orders.ts`. Unlike the retired Shipbubble integration, Terminal Africa needs no persisted one-time setup codes — the sender/warehouse address is built inline from `site-config.ts` on every request. Terminal Africa requires account KYC approval before the API works at all (a compliance gate, not a cost — its published pricing only meters duty calculation/address validation/HS code search, not rate quoting). `src/lib/shipping/tracking-service.ts` (order tracking status) remains mocked/unintegrated — separate from rate quoting.

### Type/schema conventions

- Prisma is the source of truth for data shapes; Zod schemas in `src/lib/validations/` and inline in tRPC procedure `.input()` validate at the API boundary and should mirror Prisma types rather than redefine them.
- No `any` — this is enforced by convention (see `CODING_RULES.md`), not currently by a lint rule beyond Biome's recommended set.
- Path alias `@/*` → `src/*` (see `tsconfig.json`).

---

## Workflow

The canonical workflow for this repo. Work inline — don't spawn PM/Dev/Senior-Dev subagents and don't use worktrees (each cold-starts, re-reads context, and burns credit). Spawn one `general-purpose` agent only for genuinely parallel work or a long AFK batch.

**1. Align (PM, inline).** Read the task and the real code first — grep/read for existing tRPC procedures, hooks, and lib utilities before designing anything new (see Architecture above; reuse before creating). Present understanding + exact files to change + plan, and **wait for confirmation before writing code.**

**2. Build (inline, in the working tree).** Follow the agreed plan. Reuse before creating; extend the file a thing belongs in rather than adding a parallel one. Write/update tests for business logic and tRPC procedures (test infra exists via `jest`/`playwright` scripts but has no config or test files yet — starting it on the next non-trivial business-logic change is the goal, not a blocker). The `edit-check.sh` hook flags `console.log`, `any`, files >600 lines, and hardcoded API key literals as you edit — fix immediately. Invoke the **`paystack-payments`** skill for any checkout, order-payment, webhook, or refund work, the **`cloudinary-images`** skill for any `<Image>` usage rendering a Cloudinary-sourced field, the **`terminal-africa-shipping`** skill for any shipping-rate/quote or checkout shipping-method work, and the **`promotions`** skill for any `Promotion`/discount-code or site-banner work. Propose a new skill via the Learning Loop once another module (admin permissions, loyalty, etc.) accumulates ≥3 non-obvious facts.

**3. Review before done.** Run `/code-review` on the diff; fix findings and re-run until clean. Then `pnpm run type-check` + `pnpm lint` + `pnpm test`. A feature/fix isn't done if tests fail. Never run `biome check --write` (or any formatter) broadly across files as part of a scoped edit — it reformats the *entire* file to current style rules, not just the touched lines, and any file with pre-existing style drift turns a 2-line intended change into a thousand-line diff. Make the exact edit only; check `git diff --stat` per file afterward as a sanity check — a diff much larger than the described change is the tell.

**4. Handoff + capture.** On done, move a summary to `docs/changelog/`. Update memory in `~/.claude/projects/-Users-alpha-trichome/memory/` when new patterns/rules emerge — local memory (auto-loaded each session) is the resume point across sessions.

For larger features, still slice vertically (schema+one procedure → business logic+tests → edge cases → UI) with a checkpoint after each slice. For bug fixes, steps 1 and 4 collapse — confirm the diagnosis, fix, `/code-review`, done.

---

## Learning Loop (self-improvement)

The system gets faster by routing every correction and new understanding to a durable home. Run this **checkpoint at the end of any task that changed code** (the `learning-checkpoint.sh` Stop hook nudges you when the working tree changed):

| What happened | Capture as | Where | Mode |
|---------------|-----------|-------|------|
| User corrected a detail or stated a preference | **feedback memory** (update the existing file if one covers it) + MEMORY.md pointer | `memory/feedback_*.md` | auto-capture, tell the user in one line |
| A correction is **mechanically checkable** (a grep-able rule) | **hook rule** | `.claude/hooks/edit-check.sh` | auto-capture |
| You worked a module deeply for the first time — ≥3 non-obvious facts, **no skill yet** (checkout, loyalty, admin permissions, etc.) | **new skill** | `.claude/commands/<module>.md` | **propose first, then create on yes** |
| A skill's guidance was **wrong** | fix the skill + one-line "changed X because Y" note | the skill file | auto-capture |
| 3+ feedback memories cluster on one area | **propose promoting** them into a skill or hook | — | propose first |

Rules:
- **Update, don't duplicate.** Check for an existing memory/skill that already covers it before writing a new one.
- **Skill-proposal is throttled** — only ask when the bar above is met (real task + ≥3 non-obvious facts + no existing skill), so it isn't spammy.
- **Capture is cheap, skills are bigger** — memories and hook rules are written automatically; new skills always ask first.
- **Routing test:** always-relevant rule → CLAUDE.md; user preference/correction → feedback memory; grep-able → hook; sometimes-relevant domain knowledge → skill.
