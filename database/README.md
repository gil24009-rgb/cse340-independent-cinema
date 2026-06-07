# Final Project Database

## Files

- `schema.sql`: Creates the final project tables, constraints, and indexes.
- `seed.sql`: Inserts development and test data.
- `verify.sql`: Reports seed counts, roles, booking history, and availability.

## Local Setup

Run the schema first, then the seed file.

```bash
psql "$DATABASE_URL" -f final-project/database/schema.sql
psql "$DATABASE_URL" -f final-project/database/seed.sql
psql "$DATABASE_URL" -f final-project/database/verify.sql
```

The seed script resets final project table data before inserting test records. Do not run it against production data.

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
