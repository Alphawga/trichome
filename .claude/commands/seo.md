# SEO / AI Findability Reference

Use this skill when touching page metadata, `generateMetadata`, `robots.ts`, `sitemap.ts`, JSON-LD structured data, `llms.txt`, or canonical URLs.

## Single source of truth

`src/lib/site-config.ts` exports `SITE_URL`, `SITE_NAME`, social links, and contact info. Import from here — don't hardcode the domain or re-type social URLs; they're already pulled from the canonical source, `src/components/admin/footer.tsx` (despite the `admin` folder name, this is the customer-facing footer, wired up in `src/app/(customer)/layout.tsx`).

`src/lib/structured-data.ts` has the JSON-LD builders (`buildProductJsonLd`, `buildOrganizationJsonLd`, `buildWebsiteJsonLd`, `buildBreadcrumbJsonLd`). Reuse these rather than hand-rolling schema — image URLs are normalized to absolute inside `buildProductJsonLd` (Google's structured-data validator rejects relative image URLs).

## `Product.seo_title` / `Product.seo_description` exist and were unused

Prisma's `Product` model (`prisma/schema.prisma`) has had `seo_title`/`seo_description` fields all along — nothing read them before this pass. Any per-product metadata generation should prefer these over `name`/`short_description`, so admin-entered SEO overrides actually take effect.

## `sitemap.ts` needs an explicit `revalidate` export

Next's `MetadataRoute.Sitemap` convention defaults to fully static — without `export const revalidate = 3600` (or similar), `/sitemap.xml` is frozen at build time and new products never appear until the next deploy. Confirmed via `pnpm build` output: without `revalidate`, the route shows as `○ (Static)` with no refresh interval; with it, it shows `1h / 1y`.

## Client-fetched pages leave non-JS crawlers seeing a thin body

Homepage, products listing, and product detail pages are `"use client"` components that fetch their visible content via tRPC after hydration (pre-existing architecture, not just an SEO-pass artifact). The pattern used to add metadata without a full rewrite: split each into a thin server `page.tsx` (owns `generateMetadata` + JSON-LD `<script>` tags, does its own direct Prisma fetch for metadata purposes) rendering a sibling `*Client.tsx` (the original client component, unchanged apart from the split, still tRPC-fetching its own content).

This means `<title>`/meta description/canonical/JSON-LD are always server-rendered and correct for any crawler, including non-JS-executing ones — but the actual visible page content (product name, price, etc. in the DOM) only appears after client hydration. `curl`/`view-source` on these pages will show a loading skeleton, not the real content — that's expected, not a regression. Verify metadata correctness via `curl | grep -oE '<title>|application/ld\+json|canonical'`, not by checking for real content in the raw HTML.

If a future task needs the actual body content crawlable without JS (some AI browsing tools don't execute JS), that requires prefetching the tRPC query server-side (`createServerSideHelpers`/tRPC server caller) and passing initial data into the client component — bigger scope than a metadata-only pass, do it as its own task.

## Known follow-up (not yet done)

- A handful of `fill` images without `sizes` remain on private/non-indexed account pages (cart, wishlist, profile, order-history, track-order) — low priority since `robots.ts` disallows these routes.
- Root layout's per-page title template is `"%s | Trichomes"` — any new static-metadata page should set a bare `title` (e.g. `"Shop All Products"`), not append `" | Trichomes"` manually, or the suffix doubles up.
