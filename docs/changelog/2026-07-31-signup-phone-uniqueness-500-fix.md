# 2026-07-31 — Signup "Internal server error" fix (phone-uniqueness gap)

## Context

Two customers hit "Internal server error" rendered under the Email Address field on `/auth/signup` (reported via photo of the checkout tablet). It wasn't a live/async email check — the signup form has no such thing. Root cause: `User.phone` is `@unique` in the schema, but `POST /api/auth/register` only pre-checked email uniqueness before `prisma.user.create`. Both reported cases reused the same phone number (`08138409539`) across different emails, throwing an unhandled Prisma `P2002` that fell into the route's generic catch block, which returned the literal string `"Internal server error"`. The client's `handleSubmit` catch then blindly wrote *every* registration failure into `errors.email`, which is why a phone conflict visually looked like an email problem.

The same gap (no phone pre-check) existed in two other, unrelated `User`-creation paths sharing the same model — fixed for consistency at the user's request, not because either was implicated in the reported bug:
- `src/server/modules/auth.ts`'s `register` tRPC procedure (currently unused/dead — the signup form calls the REST route directly, not this)
- `src/server/modules/users.ts`'s `createUser` (admin-only "add customer" panel)

## What changed

- `src/app/api/auth/register/route.ts`: added a phone uniqueness pre-check (skipped when phone is empty) returning `409` with `{ message, field: "phone" }`, mirroring the existing email check. Added a `Prisma.PrismaClientKnownRequestError` / `P2002` catch as a race-condition safety net, mapping the conflicting field (via `error.meta?.target`) to the same `409` shape instead of falling through to the generic 500.
- `src/app/contexts/auth-context.tsx`: added a `RegistrationError` class (`message` + `field`) so `signUpWithCredentials` can forward which field actually conflicted, instead of collapsing every failure into a plain `Error`.
- `src/app/auth/signup/page.tsx`: `handleSubmit`'s catch now routes `RegistrationError`s with an `email`/`phone` field to that specific input's error slot; anything else (a genuine 500, network failure) goes to a new top-level `generalError` banner above the submit button instead of always being mislabeled as an email error.
- `src/server/modules/auth.ts` / `src/server/modules/users.ts`: added the same phone pre-check before `prisma.user.create`, throwing `TRPCError({ code: "CONFLICT" })` on conflict — matches the existing email-check pattern already in both procedures.

## `/code-review` pass (post-first-draft)

Caught two real gaps the first draft missed: `auth.ts`'s `register` and `users.ts`'s `createUser` had the phone pre-check but no `P2002` catch around `prisma.user.create` itself, so a TOCTOU race (two concurrent requests both passing the pre-check before either write lands) would still surface as an unhandled 500 in exactly the two "for consistency" files — the bug the diff claimed to have closed everywhere. Fixed by wrapping both `create()` calls in a `.catch()` that maps `P2002` to a `TRPCError({ code: "CONFLICT" })`, matching the REST route's existing safety net. Also parallelized the email/phone pre-check queries (`Promise.all`) across all three files — was two sequential round-trips, now one (low-severity efficiency finding, fixed since it was trivial). A fourth finding (`products.ts`'s duplicated `SLUG_ERROR` string) was in unrelated pre-existing work from before this session and was left for whoever owns that diff.

## Verification

`pnpm type-check` and `pnpm test` (95 passing) run clean after both the initial fix and the code-review follow-up fixes; `git diff --stat` confirmed each file's diff stayed scoped to the intended change, no incidental reformatting. Not yet manually verified in the browser (Chrome extension wasn't connected this session) — recommend a quick manual pass: sign up two accounts with the same phone/different emails via `/auth/signup` and confirm the error now reads under **Phone Number**, not Email.
