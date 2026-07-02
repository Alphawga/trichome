# Cloudinary Images Reference

Use this skill when adding or editing any `<Image>` usage that renders a Cloudinary-sourced field (product images, category images, brand logos, uploaded content, user avatars), or when touching `src/components/ui/cloudinary-image.tsx` / `src/components/ui/image-uploader.tsx`.

## The rule

**Never pass a raw `res.cloudinary.com` URL straight into `next/image`'s `<Image>`.** Use `CloudinaryImage` from `src/components/ui/cloudinary-image.tsx` instead — it's a drop-in replacement with the same props.

```tsx
import { CloudinaryImage as Image } from "@/components/ui/cloudinary-image";
// use exactly like next/image's <Image>
```

## Why this exists

Next.js's built-in image optimizer (`/_next/image`) re-fetches every remote image server-side and re-encodes it with `sharp`, with a **hardcoded, non-configurable 7-second fetch timeout** (`node_modules/next/dist/server/image-optimizer.js`, no config surface for this). Cloudinary already does that exact transformation at its own CDN edge via URL parameters — routing Cloudinary images through Next's optimizer is pure duplicated work, and it periodically times out and 500s (confirmed root cause of a real production bug, 2026-07-02, `docs/changelog/2026-07-02-cloudinary-image-optimizer.md` if present).

## How `CloudinaryImage` works

`src/components/ui/cloudinary-image.tsx` checks if `src` starts with `https://res.cloudinary.com/`:
- If yes → renders `next-cloudinary`'s `<CldImage>`, which builds a Cloudinary transform URL (`f_auto,q_auto,w_<width>`) and serves it directly from Cloudinary's CDN, bypassing `/_next/image` entirely. `CldImage` accepts either a Cloudinary public ID *or* a full delivery URL as `src` — pass the full URL as stored in the DB, no parsing needed.
- If no → falls back to plain `next/image`, unchanged.

This matters because several DB fields are **mixed-source**, not always Cloudinary: `User.image` can be a Google OAuth avatar (`lh3.googleusercontent.com`) or a `ui-avatars.com` fallback, not just a Cloudinary upload. The wrapper's prefix check handles this safely — don't try to special-case these fields manually, just use `CloudinaryImage` everywhere and let it decide per-request.

`next-cloudinary` (`package.json`) is only used via this wrapper — no other file should import `CldImage`/`getCldImageUrl` directly unless there's a good reason to bypass the shared wrapper.

## `sizes` still matters

Even with `CldImage`, an unset (or wrong) `sizes` prop on a `fill`-mode image still causes Next to compute an oversized `width` (defaulting toward the largest `deviceSize`, up to 3840px), which gets passed into the Cloudinary transform URL — so you still request/download a bigger image than the layout needs. Always set `sizes` to match the actual rendered width at each breakpoint (see `src/components/product/product-card.tsx` for a correct example: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`).

## Known follow-up (not yet done)

~29 other `fill`-mode `<Image>`/`CloudinaryImage` usages across the app (mostly small admin thumbnails/avatars) still don't set `sizes`. They no longer risk the optimizer-timeout crash (since Cloudinary sources bypass `/_next/image` via this wrapper), but they still over-fetch. Fix opportunistically when touching those files, not as a dedicated sweep.
