# PAICONS

PAICONS is the Pakistan AI Collaboration & Opportunities Network platform for events, courses, community programs, registrations, payments, digital passes, and venue check-in.

## What is included

- Premium responsive public website
- Database-driven events and courses
- Protected organizer dashboard at `/admin/login`
- Event and course create, edit, duplicate, publish, unpublish, and delete controls
- Ticket inventory, early-bird pricing, sold-out status, and benefits
- Free and manually verified paid registration flows
- Private attendee photographs and payment receipts
- Registration search, filters, CSV export, revenue and inventory analytics
- Deterministic PNG/PDF passes, social cards, and QR codes
- Duplicate-safe ticket verification and check-in
- Partners, speakers, galleries, inquiries, policies, SEO, sitemap, and structured data

## Digital pass rule

Passes and social cards are rendered locally from a fixed template, stored event and attendee data, the attendee's uploaded photograph, and the `qrcode` library. No AI service, LLM, image model, face enhancement, generative fill, or AI-generated QR code is used in this pipeline.

## Local development

1. Copy `.env.example` to `.env` and set the organizer email allowlist plus the variables below.
2. Install dependencies with `npm install`.
3. Generate the Postgres migration with `npm run db:generate`, then apply it (e.g. `npx drizzle-kit push` or run the generated SQL in `drizzle/` against your database).
4. Start the development server with `npm run dev`.

The production deployment runs on Vercel with a Postgres database (via the Neon integration in the Vercel Marketplace), Vercel Blob for file storage, and NextAuth.js (Google) for organizer/staff sign-in. Never commit `.env` or payment credentials.

## Required production environment variables

- `ADMIN_EMAILS`: comma-separated organizer email allowlist
- `STAFF_EMAILS`: optional comma-separated check-in staff allowlist
- `SITE_URL`: canonical deployed URL
- `DATABASE_URL`: Postgres connection string (injected automatically when you attach a Postgres integration in Vercel)
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token (injected automatically when you enable Blob storage in Vercel)
- `AUTH_SECRET`: random secret for NextAuth session encryption (`npx auth secret`)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: OAuth client credentials from Google Cloud Console, with `<your-domain>/api/auth/callback/google` as an authorized redirect URI

Anyone can sign in with Google; access to `/admin` and the check-in flow is still gated by the `ADMIN_EMAILS`/`STAFF_EMAILS` allowlist.

## Verification

```bash
npm run build
npx tsc --noEmit
```
