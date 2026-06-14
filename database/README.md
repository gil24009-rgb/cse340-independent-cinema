# Final Project Database

## Files

- `schema.sql`: Creates the final project tables, constraints, and indexes.
- `seed.sql`: Inserts development and test data.
- `verify.sql`: Reports seed counts, roles, booking history, and availability.
- `migrations/`: Applies ordered, non-destructive changes to an existing database.

## Local Setup

Run the schema first, then the seed file.

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
node app/scripts/run-migrations.js
psql "$DATABASE_URL" -f database/verify.sql
```

The seed script resets final project table data before inserting test records. Do not run it against production data.

## Migrations

Use a new sequential SQL migration for every schema change after the first deployment.

```text
database/migrations/0002_short_description.sql
```

Run migrations with:

```bash
cd app
pnpm db:migrate
```

The runner records applied filenames in `schema_migrations`, applies each pending file in one transaction, and uses a PostgreSQL advisory lock to prevent concurrent migration runs. Never edit an applied migration. Add a new migration instead.

## Test Accounts

All test accounts use the course-required password:

```text
P@$$w0rd!
```

Emails:

- `owner@cinema.test`
- `staff@cinema.test`
- `member@cinema.test`

## Data Retention Rules

- Deactivate users instead of deleting accounts with bookings.
- Archive films that already have screenings.
- Cancel screenings that already have bookings.
- Cancel bookings instead of deleting them.
- Booking status changes must also create a history row in the same transaction.
