# 2026-07-02 — Fixed header nav + hero responsiveness in the 768–1023px range

## What changed

Shrinking the browser window to roughly 768–1023px wide (tablet / half-screen-desktop) broke the storefront header and hero. Root cause: most of the header already treated `lg` (1024px) as the mobile/desktop breakpoint, but the desktop nav row and the hero's mobile text-legibility gradient were left on `md` (768px), leaving a dead zone where mobile and desktop UI either overlapped or had no scrim behind text.

- `src/components/layout/header.tsx`
  - Desktop `<nav>` visibility changed from `hidden md:block` to `hidden lg:block`, aligning it with the hamburger's `lg:hidden` so exactly one is ever visible.
  - Nav item spacing changed from a fixed `space-x-20` (overflowed well before 1024px) to a responsive `gap-x-*` scale with `flex-wrap` as a safety net.
  - Logo sizing changed from non-monotonic per-breakpoint width/height boxes (grew then shrank, and overflowed its row at `sm`) to height-driven `h-12 w-auto sm:h-16`, matching the real asset's aspect ratio (`public/T3.png` is 2020×794px, not the ~1.5:1 the old props assumed).
- `src/components/sections/hero.tsx`
  - Mobile text-legibility gradient changed from `md:hidden` to `lg:hidden`, closing the 768–1023px window where no scrim sat behind the tagline against the busy product photo.
  - Headline/subtext now scale across `sm`/`md`/`lg`/`xl` instead of jumping at a single breakpoint.
  - Removed a dead `mt-15` class (not a valid Tailwind v3 utility — was a no-op).

## Why

The header's mobile/desktop cutoff was already `lg` everywhere else (search bar, wishlist/cart icons, and the existing `@media (max-width: 1023px)` blocks in `globals.css`); the nav row and hero gradient were the outliers.

## Still open (flagged, not fixed)

- Even at full desktop width, the hero tagline has low contrast against the background photo (pre-existing 10%-opacity dark overlay) — not part of the reported bug, deferred pending user input.
- Video parallax for the hero was considered and explicitly deferred by the user — no new dependencies added.
