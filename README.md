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

1. Copy `.env.example` to `.env` and set the organizer email allowlist.
2. Install dependencies with `npm run install:ci`.
3. Generate and apply the D1 migration in `drizzle/`.
4. Start the development server with `npm run dev`.

The production deployment uses a D1 database, R2 file storage, and environment variables managed by the hosting platform. Never commit `.env` or payment credentials.

## Required production environment variables

- `ADMIN_EMAILS`: comma-separated organizer email allowlist
- `STAFF_EMAILS`: optional comma-separated check-in staff allowlist
- `SITE_URL`: canonical deployed URL

## Verification

```bash
npm run build
npx tsc --noEmit
```
