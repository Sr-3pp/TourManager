# TourManager

TourManager is a Nuxt 4 application for publishing tours, managing organizer profiles, and surfacing featured tours and organizers on a public homepage.

## Stack

- Nuxt 4 + Vue 3
- Nuxt UI
- MongoDB + Mongoose
- Better Auth
- Cloudflare R2 compatible blob storage
- Vitest + Playwright

## Features

- Public homepage with featured tours and featured organizers
- Organizer profile pages
- Authenticated organizer profile management
- Tour creation and editing with packages, attendees, sponsors, and departure points
- Admin user management
- SEO metadata, OG image defaults, sitemap, and robots handlers

## Development

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test:unit
pnpm test:nuxt
pnpm test:e2e
```

## Environment

The app expects a `.env` file with the following values:

```bash
BETTER_AUTH_SECRET=
NUXT_MONGODB_URI=
NUXT_MONGODB_DB_NAME=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

NUXT_PUBLIC_SITE_NAME=Tour Manager
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_DEFAULT_SEO_DESCRIPTION=Descubre tours destacados y organizadores en Tour Manager.
NUXT_PUBLIC_DEFAULT_OG_IMAGE=/og/default.svg
```

## Architecture Notes

- `app/pages`: route containers and SEO orchestration
- `app/components`: UI sections and forms
- `app/composables`: feature state and API access
- `app/utils`: shared client helpers for API calls, display formatting, and form mapping
- `server/api`: thin route handlers
- `server/services`: request parsing and domain-specific input assembly
- `server/utils`: infrastructure helpers such as auth, db, image compression, validation, and R2
- `server/models`: Mongoose models
- `types`: shared client/server TypeScript contracts

## Refactor Direction

The codebase is being refactored incrementally with a stability-first approach:

- keep routes and visible behavior stable
- reduce duplication in server validation and multipart parsing
- split large tour page/form files into smaller UI sections
- centralize authenticated fetch behavior on the client
- improve tests around the extracted shared helpers
