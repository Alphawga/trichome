# 2026-07-02 — SEO + AI/LLM findability overhaul

## What changed

The site had no crawl/discovery infrastructure — no `robots.txt`, no sitemap, zero structured data, and every product/category page inherited one stale static "Coming Soon" title from the root layout. This pass fixed the crawl layer end-to-end:

- **`src/lib/site-config.ts`** — single source of truth for `SITE_URL`, social links, contact info (pulled from the existing footer, `src/components/admin/footer.tsx`). New env var `NEXT_PUBLIC_SITE_URL` (`.env`, `.env.example`).
- **`src/app/robots.ts`** — disallows admin/api/auth/checkout/cart/account-type routes, points to the sitemap.
- **`src/app/sitemap.ts`** — Prisma-driven, includes all active products + static routes. `revalidate = 3600` so new products appear within an hour without a redeploy.
- **`public/llms.txt`** — plain-markdown summary of the business and key pages, per the emerging llms.txt convention for AI crawlers.
- **`src/lib/structured-data.ts`** — `buildProductJsonLd`, `buildOrganizationJsonLd`, `buildWebsiteJsonLd`, `buildBreadcrumbJsonLd` helpers (image URLs normalized to absolute).
- **Root layout** (`src/app/layout.tsx`) — replaced "Coming Soon" copy with real title/description, added `metadataBase` and a title template (`%s | Trichomes`).
- **Server/client split** for the three pages that were entirely `"use client"` with no metadata: homepage (`page.tsx` + `HomePageClient.tsx`), products listing (`page.tsx` + `ProductsPageClient.tsx`), product detail (`page.tsx` + `ProductDetailsClient.tsx`). Each new `page.tsx` is a thin server component with `generateMetadata` (product detail pulls `seo_title`/`seo_description` from Prisma, previously unused fields), a canonical URL, and JSON-LD `<script>` tags. Product detail's `generateMetadata` does a live Prisma fetch and returns 404 via `notFound()` for missing products.
- Fixed a genuine duplicate heading on the product detail page (`ProductDetailsClient.tsx`): an `<h2>` was repeating the `<h1>` product name — changed to a `<p>`.
- Added missing `sizes` prop to the two `fill`-based images on the product detail page (main image, zoom modal) for LCP.
- Static content pages (`privacy`, `terms`, `returns`, `shipping`) got `alternates.canonical`; stripped their manually-hardcoded `" | Trichomes"` title suffix since the root template now adds it (was about to double up).

## Why

Google, Bing, and LLM answer engines (ChatGPT browsing, Claude, Perplexity, Google AI Overviews) had no way to discover the product catalog or distinguish one product page from another — every page shared the same "Coming Soon" title regardless of URL.

## Verified

- `pnpm build` — all routes compile; `/sitemap.xml` shows `1h` ISR revalidation.
- Confirmed via running dev server: `/robots.txt`, `/sitemap.xml` (real product IDs from Prisma), `/llms.txt` all serve correctly; homepage/products/product-detail pages each render a distinct `<title>`, meta description, canonical link, and valid JSON-LD (`Organization`+`WebSite` on home, `BreadcrumbList` on products, `Product`+`BreadcrumbList` on product detail with absolute image URLs).
- Two flagged "missing/duplicate h1" issues from the initial audit (homepage, about, checkout, track-order) turned out to be false positives — the audit only checked the page.tsx wrapper, not the child client component that actually renders the heading. Only the product detail page had a genuine duplicate, which is fixed.

## Still open

- **Placeholder contact info**: the footer's phone number (`+234 123 456 7890`) looks like a placeholder and is now also embedded in the `Organization` JSON-LD via `site-config.ts` — confirm the real number before this ships, since it'll be indexed by search engines.
- **Client-rendered content**: homepage/products/product-detail pages fetch their visible body via tRPC on the client (pre-existing pattern, unchanged here). The server-rendered `<title>`/meta/JSON-LD is correct for all crawlers, but non-JS-executing text-fetch bots (e.g. GPTBot) will see a thin/loading page body until hydration. A future pass could prefetch this data server-side (tRPC server helpers) for full SSR content.
- A handful of other `fill` images without `sizes` exist on private/non-indexed pages (cart, wishlist, profile, order-history, track-order) — left out of scope since those routes are disallowed in `robots.ts` and aren't organic landing pages.
- `ProductsPageClient.tsx` is 711 lines (was already this size before the split) — flagged by the edit-check hook, not addressed here since it's a pre-existing size, not new.
