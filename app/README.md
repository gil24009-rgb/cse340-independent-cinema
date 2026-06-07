# Independent Cinema Application

This directory contains the standalone final project application. It remains separate from earlier CSE 340 coursework in the repository root.

## Requirements

- Node.js 20 or newer
- pnpm
- PostgreSQL

## Setup

```bash
pnpm install
cp .env.example .env
```

Configure `DATABASE_URL` in `.env`, then apply the database files from the repository root:

```bash
psql "$DATABASE_URL" -f final-project/database/schema.sql
psql "$DATABASE_URL" -f final-project/database/seed.sql
psql "$DATABASE_URL" -f final-project/database/verify.sql
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

## Current Structure

```text
src/
  config/        Environment and PostgreSQL pool
  controllers/   Request handlers and view data
  middleware/    Shared view context, validation, and errors
  routes/        Route definitions
views/
  errors/        Stable error states
  partials/      Shared document, header, and footer structure
public/
  css/           Application styles
test/            Node test runner coverage
```

## Health Routes

- `/health`: Confirms the Express application is running.
- `/health/database`: Confirms the configured PostgreSQL database is reachable.

The `/health/database` route intentionally reaches the global error handler when `DATABASE_URL` is missing or the database is unavailable.
