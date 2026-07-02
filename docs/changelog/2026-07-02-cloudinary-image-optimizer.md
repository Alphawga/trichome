# 2026-07-02 — Cloudinary images bypass Next's image optimizer

## What changed

Dev server was throwing `TimeoutError`/500s on `/_next/image?url=...res.cloudinary.com...` (homepage category grid). Root cause: Next.js's built-in image optimizer re-fetches and re-encodes every remote image server-side with a hardcoded, non-configurable 7-second timeout — redundant work, since Cloudinary already transforms/serves optimized images from its own CDN via URL params. `next-cloudinary` was already an installed dependency for exactly this, but unused (0 references in `src/`).

- Added `src/components/ui/cloudinary-image.tsx` — a drop-in `<Image>` replacement (`CloudinaryImage`) that routes `res.cloudinary.com`-sourced images through `next-cloudinary`'s `<CldImage>` (bypassing `/_next/image` entirely) and falls back to plain `next/image` for everything else (Google avatars, local assets).
- Swapped the import across 26 files wherever `<Image>` renders a Cloudinary-sourced field (category, product, brand, uploads).
- Added missing `sizes` prop to the two `fill`-mode images that had none (homepage category grid, upload preview) — without it, Next always requests the largest `deviceSize` (up to 3840px) regardless of actual render size.

## Why

The category grid image had no `sizes`, so it always requested the largest variant even at ~280–650px card size, making it the most likely to blow the optimizer's fixed 7s budget under real network latency (dev DB points at production Supabase — see `.env`).

## Still open

- ~29 other `fill`-mode image usages (mostly small admin thumbnails/avatars) still lack `sizes` — no longer a crash risk since Cloudinary sources bypass the optimizer, but still over-fetch. Fix opportunistically, not as a dedicated sweep.
- `.env` pointing local dev at production Supabase remains a separate, unaddressed latency/safety concern.

See the `cloudinary-images` skill (`.claude/commands/cloudinary-images.md`) for the full reference.
