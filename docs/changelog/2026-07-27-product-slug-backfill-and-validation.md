# 2026-07-27 — Product slug backfill + validation guardrail

## Context

User reported a 404 clicking "Add to bag" on a product, routing to `https://www.trichomesshop.com/products/Seoul%201988%20Glow%20Serum%20Niacinamide%2015%%20+%20Tranexamic%20Acid`. Investigation found this wasn't isolated: **426 of 430 products** in the live DB had `Product.slug` set to the raw human-readable product name (spaces, mixed case, literal `%`/`+`) instead of a proper kebab-case slug. The reported product's slug contained `%` immediately before a space; the browser's own `%20`-encoding of that space collided with the literal `%`, producing an invalid percent-escape sequence in the URL that Next.js couldn't decode back to the exact DB value, so the exact-match `prisma.product.findUnique({ where: { slug } })` in `products/[slug]/page.tsx` missed and 404'd.

Root cause traced to manual admin data entry, not a bulk import: `ProductFormSheet.tsx`'s auto-slug effect only ran on new products and used a naive `.toLowerCase().replace(/[^a-z0-9]+/g,"-")` on the product name — but this catalog's names are pasted in from a social-catalog source using stylized Unicode ("Mathematical Alphanumeric Symbols", e.g. "𝑺𝑬𝑶𝑼𝑳" instead of "SEOUL"), which the regex can't handle (different code points, not case variants), so the auto-slug came out as garbage. Whoever entered these products by hand apparently noticed and retyped the plain title into the Slug box instead of a real slug — and nothing validated the format client- or server-side, so this went uncaught 426 times.

Note: `scripts/audit-unicode-product-names.ts` (added 2026-07-25, same day slug-based routing shipped) already normalizes this same stylized-Unicode text in `name`/`description`, but deliberately left `slug` untouched at the time "to avoid invalidating the redirect work." That caution no longer applied here — slug-based routing had only been live 2 days, so nothing was meaningfully indexed under the broken slugs yet, and old `/products/[id]` links still redirect via the existing `resolveSlugFromLegacyId` legacy path regardless of what `slug` is now.

## What changed

**Backfill.** One-off script (not committed — run directly against production via Prisma, then deleted) regenerated `slug` for all 426 affected products: candidate = `slugify(name.normalize("NFKD"))` (NFKD recovers plain ASCII from the Mathematical Alphanumeric block), falling back to `slugify(existing slug)` if the name-derived candidate was less descriptive, deduped with a `-2`/`-3`… suffix on collision (4 needed one). Verified after: 430/430 unique slugs, 0 empty, 0 remaining rows matching the "broken" pattern (`slug ~ '[ %+]'` or `slug ~ '[A-Z]'`). `CartItem`/`OrderItem` reference `product_id`, not `slug`, so cart/order data was unaffected.

Per user's explicit choice, no redirect-preservation was built for the old broken-text slugs — old id-based links (what's actually shared/indexed) continue to work via the existing legacy-id redirect.

**Recurrence guardrail.**
- `ProductFormSheet.tsx`: auto-slug effect now calls `.normalize("NFKD")` before slugifying, so future stylized-Unicode names produce a real slug instead of garbage.
- `src/lib/dto.ts`: added `SLUG_REGEX` (`^[a-z0-9]+(-[a-z0-9]+)*$`) and applied it to `createProductSchema`/`updateProductSchema`'s `slug` field.
- `src/server/modules/products.ts`: added a local `slugField` schema using the same regex, applied to `createProduct` and `updateProduct` tRPC inputs — the actual enforced boundary. A non-kebab-case slug can no longer be saved from any entry path.

## Verified

- `pnpm type-check`: no new errors — all remaining failures are pre-existing, in files untouched by this change.
- `pnpm exec biome check` on the three touched files: no new issues; remaining warnings are pre-existing formatting drift in surrounding code, left alone per convention.
- Manually re-queried the reported product post-backfill: `slug` is now `seoul-1988-glow-serum-niacinamide-15-tranexamic-acid`.
- Regex sanity-checked against known-good/bad slug shapes (leading/trailing/double hyphens, uppercase, empty).

## Not done / follow-up

- Not committed yet — diff is staged for review (`/code-review` + `pnpm test` still pending as of this writing).
- Sitemap (`revalidate = 3600`) will pick up the new slugs within the hour; not manually force-revalidated.
- Categories/brands were not audited for the same stylized-Unicode → slug issue — flagged in the `seo` skill as unaudited.
