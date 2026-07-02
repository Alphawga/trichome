# Transactional Email Reference

Use this skill when touching email sending, provider config, or templates — `src/lib/email/email-service.ts`, `src/lib/email/index.ts`, `src/lib/email/password-reset.ts`, and any caller of `sendEmail`/`sendBulkEmail` (e.g. `src/server/modules/consultations.ts`, `src/app/auth/forgot-password/page.tsx`).

## Architecture (single entry point, provider-swappable)

`sendEmail`/`sendBulkEmail` in `src/lib/email/email-service.ts` are the only functions callers use — every provider swap stays isolated to this one file, nothing else needs to change. `getEmailService()` picks an implementation by env var, in this precedence order:

1. `RESEND_API_KEY` set → `ResendEmailService` (Resend SDK, current live provider as of 2026-07-02, checked even outside production so it can be tested from dev)
2. SMTP env vars set (`SMTP_SERVER`/`SMTP_HOST` + `SMTP_LOGIN`/`LOGIN`/`SMTP_USER` + `SMTP_PASSWORD`) → `ProductionEmailService` (Nodemailer SMTP — this is the path Brevo used, via `SMTP_SERVER`; kept as a fallback provider option, not removed)
3. Neither configured → `DevelopmentEmailService` (console.log only, no real send)

## Resend gotchas (confirmed live, not from docs alone)

- **Domain must be verified before you can send from it.** Sending from `noreply@<yourdomain>` without verifying that domain in the Resend dashboard fails with `403 domain_not_verified` — confirmed via a real send attempt, not a guess. Verification means adding SPF/DKIM DNS records at the domain registrar and waiting for Resend to confirm them.
- **Until verified, the only usable sender is `onboarding@resend.dev`**, and Resend restricts that sender to delivering only to the email address on the Resend account itself — not to arbitrary customers. Fine for a one-off connectivity test, useless for real transactional email.
- Before assuming a code bug in an email failure, check `resend.com/domains` for verification status first — this is the most likely cause of a real-looking send failure.

## Known gaps (as of 2026-07-03)

- No automated tests cover `email-service.ts` or any provider implementation.
- The pre-existing SMTP path (`ProductionEmailService`) was never removed — if Resend runs into trouble, switching back to SMTP (Brevo or another provider) is just an `.env` change, no code change, since it's still wired into `getEmailService()`.

**Resolved 2026-07-03:** `trichomesshop.com` is verified on Resend (DKIM/SPF DNS records added and confirmed) — live sending from `noreply@trichomesshop.com` works end-to-end, confirmed via a real send with a returned Resend message ID.
