# Admin-editable hero slider with live device preview

The homepage hero was a single hardcoded/DB-row slot. Admins can now manage a rotating set of hero slides (title/description/CTA + an image or video background) from `/admin/content/hero-slides`, with a live mobile/tablet/desktop preview before publishing.

## What changed

- Reused the existing `Content` model (`type: "HOME_HERO"`) — no migration needed. `getContentByType` already returned an array ordered by `sort_order`; `hero.tsx` only rendered `[0]` before.
- `hero.tsx` is now a hand-rolled autoplay slider (dots, arrows, pause on hover/focus, `prefers-reduced-motion` aware) over `HeroSlideView`, a new shared presentational component.
- `/api/upload` now accepts video (`mp4`/`webm`/`quicktime`, 50MB cap) alongside images (10MB cap), detecting `resource_type` from the validated MIME type. MIME/size constants deduplicated into `src/lib/constants/media-upload.ts`.
- New `MediaUploader` component (image/video toggle) used by the new admin form.
- Live device preview: a dedicated top-level route `/hero-slide-preview` (outside `/admin`, since `admin/layout.tsx` wraps every `/admin/*` route in sidebar chrome) renders `HeroSlideView` full-bleed, fed via `postMessage` from an `<iframe>` sized to real device widths in the admin form. This was necessary because Tailwind's `sm:`/`md:`/`lg:` breakpoints respond to the real browser viewport, not a shrunk `<div>` — a scaled-container preview would have rendered all three device sizes identically.
- Removed the old single-item Hero editor from the generic content editor (`/admin/content/home`) since it used `upsertContent` (find-first-by-type) against the same rows the new multi-slide manager uses — the two would have fought over the same data. Replaced with a link to the new manager, plus a discoverable card on the `/admin/content` hub.

## Known follow-ups (flagged in review, intentionally deferred)

- **Video upload cap is likely unreachable in production.** Vercel's Node serverless functions cap request bodies around ~4.5MB with no override in this repo; the 50MB video cap (and the pre-existing 10MB image cap) can't actually be hit once deployed. Real fix is a direct-to-Cloudinary signed browser upload bypassing the Next.js server — not done here, scoped as a follow-up.
- **Hard delete on hero slides.** `deleteContent` does a real `prisma.content.delete` — `Content` has no `deleted_at`, so this is the first UI surface that permanently destroys a `Content` row (pre-existing infra, newly exercised). Proper fix (`deleted_at` on `Content`) touches every other content section, deferred.
- Editing a slide whose `status` is `SCHEDULED`/`ARCHIVED` (currently unreachable — nothing in the app sets those for `Content`) and saving would silently downgrade it to `DRAFT`, since the form only offers Draft/Published.

## Fixed during review

- Hero slider briefly collapsed to zero height for one frame when the active slide's index became stale relative to a shrunk slide list (derived `safeIndex` via modulo instead of a correcting `useEffect`).
- No validation required at least one media source before saving a slide (silently fell back to the hardcoded default image).
- Off-screen video slides kept decoding/playing in the background; now paused via ref when not the active slide.
- `image/jpg` MIME mismatch between client and server upload validation.
- Dead `HOME_DEFAULTS.hero` left behind in the content editor after removing the old hero block.
