# Independent Cinema Application

This directory contains the standalone final project application.

## Requirements

- Node.js 20 or newer
- pnpm
- PostgreSQL

## Setup

```bash
pnpm install
cp .env.example .env
```

Configure `DATABASE_URL` and a long random `SESSION_SECRET` in `.env`, then apply the database files from the repository root:

```bash
psql "$DATABASE_URL" -f ../database/schema.sql
psql "$DATABASE_URL" -f ../database/seed.sql
pnpm db:migrate
psql "$DATABASE_URL" -f ../database/verify.sql
```

## Run

```bash
pnpm dev
```

Default local URL:

```text
http://localhost:3400
```

## Test

```bash
pnpm test
```

Database integration tests run when `DATABASE_URL` is configured. Without it, the database-only tests are reported as skipped.

## Current Structure

```text
src/
  config/        Environment, PostgreSQL pool, and session configuration
  controllers/   Request handlers and view data
  middleware/    Authentication, authorization, CSRF, validation, and errors
  models/        PostgreSQL queries owned by each domain
  routes/        Route definitions
views/
  account/       Protected role landing pages
  auth/          Authentication forms
  errors/        Stable forbidden, not-found, and server-error states
  partials/      Shared document, header, and footer structure
public/
  css/           Application styles
test/            Node test runner coverage
```

## Health Routes

- `/health`: Confirms the Express application is running.
- `/health/database`: Confirms the configured PostgreSQL database is reachable.

The `/health/database` route intentionally reaches the global error handler when `DATABASE_URL` is missing or the database is unavailable.

## Render Deployment

The root `render.yaml` creates the web service and PostgreSQL database. During each free-tier build, Render runs `scripts/initialize-database.js`. The script applies the schema and development seed accounts only when the application tables do not exist, then applies pending ordered migrations.
