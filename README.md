# Independent Cinema Platform

A server-rendered cinema operations platform for a single-screen independent theater. The project combines a public film and screening experience with role-specific booking, staff, and owner workflows.

## Start Here

Read these documents in order before making a structural or product decision:

1. [Project Context](docs/project-context.md)
2. [Current Status](docs/current-status.md)
3. [Decision Log](docs/decision-log.md)
4. [Master Roadmap](planning/00-master-roadmap-ko.md)
5. [Requirements Traceability](planning/requirements-traceability-ko.md)

The context and status documents provide the shortest path into the project. The planning directory contains the detailed reasoning, data contracts, and implementation sequence.

## Product Direction

The platform serves four user contexts:

- Public visitors browse films, view screenings, read theater information, and send contact messages.
- Members book screenings, track booking history, and manage their own reviews.
- Staff operate check-in, booking statuses, review moderation, and contact messages.
- Owners manage all staff operations plus films, screenings, users, and roles.

The main workflow is booking status management with an immutable status history. Payment, seat selection, multiple auditoriums, external APIs, recommendations, and social login are intentionally outside the project scope.

## Technical Direction

- Node.js 20+
- Express 5
- EJS server-side rendering
- PostgreSQL
- ESM modules
- Session authentication
- Render deployment

The implementation follows an MVC-oriented structure with shared middleware, server-side validation, centralized error handling, and role-aware navigation.

## Repository Map

```text
app/              Express application, views, styles, and tests
database/         PostgreSQL schema, seed data, and verification queries
docs/             Concise project context, status, and decisions
planning/         Detailed roadmap, architecture, and requirements mapping
progress/         Weekly progress records
quality-reviews/  Reference and interface quality reviews
requirements/     Original assignment requirements and summary
```

## Run Locally

```bash
cd app
pnpm install
cp .env.example .env
```

Configure `DATABASE_URL`, then run:

```bash
psql "$DATABASE_URL" -f ../database/schema.sql
psql "$DATABASE_URL" -f ../database/seed.sql
pnpm db:migrate
psql "$DATABASE_URL" -f ../database/verify.sql
pnpm dev
```

Default local URL:

```text
http://localhost:3400
```

Run automated tests:

```bash
cd app
pnpm test
```

## Current Stage

Steps 1 through 3 are complete. Step 4 authentication and authorization is in progress. Login, logout, session identity, role guards, Member signup, duplicate-email handling, bcrypt password hashing, and ownership-protected Member booking and review detail routes are implemented and verified. Direct PostgreSQL session-table verification is complete. The independent authentication review remains. See [Current Status](docs/current-status.md) for the exact next tasks and verification gates.

## Deployment

Render deployment is defined in `render.yaml`. The Blueprint creates the Node.js web service, PostgreSQL database, generated session secret, and initial schema and seed setup.

Live URL:

```text
https://cse340-independent-cinema.onrender.com
```
