# Content / CMS Reference

Use this skill when touching site content editing (`src/app/admin/content/`), the `Content` Prisma model, `src/server/modules/content.ts`, `src/lib/constants/content-types.ts`, or building any "admin edits X, sees a live preview before publishing" feature.

## `Content` is one generic model with two incompatible usage patterns

`Content` (`prisma/schema.prisma`) is a single table keyed by a `type` string, used two different ways depending on whether a `type` is meant to hold one row or many:

- **Single-row-per-type** (most `CONTENT_TYPES`, e.g. `ABOUT_MISSION`, `HOME_WHY_CHOOSE`): edited via the generic content editor (`src/app/admin/content/[slug]/page.tsx`, `InlineEditor`/`EditableSection`) which calls `upsertContent` — find-first-by-type, then update-or-create. `getPageContent`/`getContentByTypes` build a `Record<type, content>` map, silently overwriting if multiple rows share a type.
- **Multi-row-per-type** (currently only `HOME_HERO`, as of the 2026-07-07 hero slider work — see `[[project-hero-slider]]`): `getContentByType` already returns a full array ordered by `sort_order`; multi-row types need their own dedicated admin CRUD UI using `createContent`/`updateContent`/`deleteContent` directly, **not** `upsertContent`.

**Never let both patterns target the same `type`.** If you convert a single-row type to multi-row (or vice versa), remove it from `EDITABLE_PAGES` in `content-types.ts` and delete its `EditableSection` block in `[slug]/page.tsx` — otherwise the generic editor's `upsertContent` will silently edit/overwrite an arbitrary one of the rows.

## `deleteContent` is a hard delete — `Content` has no `deleted_at`

Despite this repo's "soft-delete everywhere" convention, `Content` was never given a `deleted_at` column, and `deleteContent` calls `prisma.content.delete` directly. This was harmless while nothing in the UI ever called it (all existing single-row sections only ever create/update via `upsertContent`); the hero slider was the first feature to wire an actual delete button to it. Adding `deleted_at` to `Content` would need to touch every `Content`-backed query, not just the new feature — treat as known infra debt, don't silently reach for a hard delete in new UI without flagging it.

## Building a "live preview before publishing" feature

Two hard constraints, learned from the hero slider's device preview:

1. **`src/app/admin/layout.tsx` wraps every `/admin/*` route in sidebar/header chrome.** An iframe embedded in an admin sheet cannot point at any `/admin/*` path — it needs a top-level route outside `/admin` (see `src/app/hero-slide-preview/page.tsx`), self-guarded via `useAuth()` since it won't inherit the admin layout's auth check.
2. **Tailwind's `sm:`/`md:`/`lg:`/`xl:` respond to the real browser window width, not a container's width.** A preview that just shrinks a `<div>` renders every device size identically (just scaled) — it will not re-trigger breakpoints. The only accurate fix (short of switching to container queries app-wide) is an `<iframe>` sized to the real target device width, fed live draft state via `postMessage` with `event.origin` validated on both ends. Reuse the pattern in `src/lib/constants/hero-preview.ts` + `hero-slide-preview/page.tsx` + `HeroSlideFormSheet.tsx` rather than re-deriving it.

## Media upload constants live in one place

`src/lib/constants/media-upload.ts` is the single source of truth for allowed image/video MIME types and size caps, used by `/api/upload/route.ts` (server-side validation + `resource_type` detection), `ImageUploader`, and `MediaUploader`. Add new formats/caps there, not in any of the three consumers directly — they used to be defined independently in all three and drifted (e.g. `image/jpg` was accepted client-side but rejected server-side).

## Upload size caps may be unreachable on Vercel

`/api/upload/route.ts` buffers the whole request body in memory (`request.formData()` + `file.arrayBuffer()`) before forwarding to Cloudinary. Vercel's Node.js serverless functions cap request bodies around ~4.5MB with no override configured in this repo (no `vercel.json`, no runtime/body-size config) — the route's own `MAX_IMAGE_SIZE_BYTES`/`MAX_VIDEO_SIZE_BYTES` checks (10MB/50MB) are likely unreachable in production regardless of what they say. If a feature needs to reliably accept files anywhere near those caps, the real fix is a signed direct-to-Cloudinary browser upload that bypasses this route entirely — flagged as follow-up work in `[[project-hero-slider]]`, not yet built.
