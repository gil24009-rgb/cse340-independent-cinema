import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import pg from "pg";

import { runMigrations } from "../scripts/run-migrations.js";

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
const integrationTest = databaseUrl ? test : test.skip;
let pool;

function storeOperation(store, method, ...args) {
  return new Promise((resolve, reject) => {
    store[method](...args, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

before(async () => {
  if (databaseUrl) {
    pool = new Pool({ connectionString: databaseUrl });
  }
});

after(async () => {
  await pool?.end();
});

integrationTest("database migrations apply once and record their state", async () => {
  const client = await pool.connect();

  try {
    await runMigrations({ client });
    await runMigrations({ client });

    const result = await client.query(
      "SELECT COUNT(*)::INTEGER AS count FROM schema_migrations WHERE filename = $1",
      ["0001_baseline.sql"],
    );

    assert.equal(result.rows[0].count, 1);
  } finally {
    client.release();
  }
});

integrationTest("database rejects invalid roles and duplicate bookings", async () => {
  await assert.rejects(
    pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ["invalid-role@cinema.test", "hash", "Invalid", "Role", "administrator"],
    ),
    (error) => error.code === "23514",
  );

  const bookingResult = await pool.query(
    "SELECT user_id, screening_id FROM bookings ORDER BY booking_id LIMIT 1",
  );
  const booking = bookingResult.rows[0];

  await assert.rejects(
    pool.query(
      "INSERT INTO bookings (user_id, screening_id) VALUES ($1, $2)",
      [booking.user_id, booking.screening_id],
    ),
    (error) => error.code === "23505",
  );
});

integrationTest("PostgreSQL session store creates, reads, and destroys a session", async () => {
  const PostgreSqlStore = connectPgSimple(session);
  const store = new PostgreSqlStore({
    createTableIfMissing: true,
    pool,
    tableName: "user_sessions",
  });
  const sessionId = `integration-${Date.now()}`;
  const sessionData = {
    cookie: { maxAge: 60_000 },
    userId: 1,
  };

  await storeOperation(store, "set", sessionId, sessionData);
  const storedSession = await storeOperation(store, "get", sessionId);
  assert.equal(storedSession.userId, 1);

  await storeOperation(store, "destroy", sessionId);
  const destroyedSession = await storeOperation(store, "get", sessionId);
  assert.equal(destroyedSession, undefined);
});
