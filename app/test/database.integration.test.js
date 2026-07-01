import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import pg from "pg";

import { runMigrations } from "../scripts/run-migrations.js";
import {
  BookingCapacityConflictError,
  BookingCancellationConflictError,
  BookingDuplicateConflictError,
  BookingStatusTransitionConflictError,
  cancelMemberBooking,
  createMemberBooking,
  findBookingStatusHistoryByBookingId,
  transitionStaffBookingStatus,
} from "../src/models/bookingModel.js";
import { closeDatabase } from "../src/config/database.js";

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
  await closeDatabase();
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

integrationTest("member booking creation writes initial history and protects capacity", async () => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const email = `booking-${suffix}@cinema.test`;
  const otherEmail = `booking-other-${suffix}@cinema.test`;
  const userResult = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, 'member')
     RETURNING user_id`,
    [email, "hash", "Booking", "Member"],
  );
  const otherUserResult = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, 'member')
     RETURNING user_id`,
    [otherEmail, "hash", "Other", "Member"],
  );
  const userId = userResult.rows[0].user_id;
  const otherUserId = otherUserResult.rows[0].user_id;
  const staffUserResult = await pool.query("SELECT user_id FROM users WHERE role = 'staff' ORDER BY user_id LIMIT 1");
  const staffUserId = staffUserResult.rows[0].user_id;
  const filmResult = await pool.query("SELECT film_id FROM films WHERE is_archived = FALSE ORDER BY film_id LIMIT 1");
  const filmId = filmResult.rows[0].film_id;
  const openScreeningResult = await pool.query(
    `INSERT INTO screenings (film_id, starts_at, capacity, ticket_price_cents, status)
     VALUES ($1, CURRENT_TIMESTAMP + INTERVAL '40 days', 2, 1200, 'scheduled')
     RETURNING screening_id`,
    [filmId],
  );
  const fullScreeningResult = await pool.query(
    `INSERT INTO screenings (film_id, starts_at, capacity, ticket_price_cents, status)
     VALUES ($1, CURRENT_TIMESTAMP + INTERVAL '41 days', 1, 1200, 'scheduled')
     RETURNING screening_id`,
    [filmId],
  );
  const openScreeningId = openScreeningResult.rows[0].screening_id;
  const fullScreeningId = fullScreeningResult.rows[0].screening_id;

  try {
    const booking = await createMemberBooking({ screeningId: openScreeningId, userId });
    assert.equal(booking.user_id, userId);
    assert.equal(booking.screening_id, openScreeningId);
    assert.equal(booking.status, "confirmed");

    const historyResult = await pool.query(
      `SELECT from_status, to_status, changed_by_user_id, note
       FROM booking_status_history
       WHERE booking_id = $1`,
      [booking.booking_id],
    );
    assert.equal(historyResult.rows.length, 1);
    assert.equal(historyResult.rows[0].from_status, null);
    assert.equal(historyResult.rows[0].to_status, "confirmed");
    assert.equal(historyResult.rows[0].changed_by_user_id, userId);
    assert.equal(historyResult.rows[0].note, "Booking created.");

    await assert.rejects(
      createMemberBooking({ screeningId: openScreeningId, userId }),
      BookingDuplicateConflictError,
    );

    await pool.query(
      "INSERT INTO bookings (user_id, screening_id, status) VALUES ($1, $2, 'confirmed')",
      [otherUserId, fullScreeningId],
    );

    await assert.rejects(
      createMemberBooking({ screeningId: fullScreeningId, userId }),
      BookingCapacityConflictError,
    );

    const operationalBooking = await createMemberBooking({ screeningId: openScreeningId, userId: otherUserId });
    const checkedIn = await transitionStaffBookingStatus({
      bookingId: operationalBooking.booking_id,
      changedByUserId: staffUserId,
      toStatus: "checked_in",
    });
    assert.equal(checkedIn.status, "checked_in");

    const completed = await transitionStaffBookingStatus({
      bookingId: operationalBooking.booking_id,
      changedByUserId: staffUserId,
      toStatus: "completed",
    });
    assert.equal(completed.status, "completed");

    const operationalHistory = await findBookingStatusHistoryByBookingId(operationalBooking.booking_id);
    assert.equal(operationalHistory.length, 3);
    assert.equal(operationalHistory[1].from_status, "confirmed");
    assert.equal(operationalHistory[1].to_status, "checked_in");
    assert.equal(operationalHistory[1].changed_by_user_id, staffUserId);
    assert.equal(operationalHistory[2].from_status, "checked_in");
    assert.equal(operationalHistory[2].to_status, "completed");
    assert.equal(operationalHistory[2].changed_by_user_id, staffUserId);

    await assert.rejects(
      transitionStaffBookingStatus({
        bookingId: operationalBooking.booking_id,
        changedByUserId: staffUserId,
        toStatus: "no_show",
      }),
      BookingStatusTransitionConflictError,
    );

    const cancelled = await cancelMemberBooking({ bookingId: booking.booking_id, userId });
    assert.equal(cancelled.status, "cancelled");
    assert.ok(cancelled.cancelled_at);

    const cancelledHistoryResult = await pool.query(
      `SELECT from_status, to_status, changed_by_user_id, note
       FROM booking_status_history
       WHERE booking_id = $1
       ORDER BY history_id DESC
       LIMIT 1`,
      [booking.booking_id],
    );
    assert.equal(cancelledHistoryResult.rows[0].from_status, "confirmed");
    assert.equal(cancelledHistoryResult.rows[0].to_status, "cancelled");
    assert.equal(cancelledHistoryResult.rows[0].changed_by_user_id, userId);
    assert.equal(cancelledHistoryResult.rows[0].note, "Booking cancelled by member.");

    const statusHistory = await findBookingStatusHistoryByBookingId(booking.booking_id);
    assert.equal(statusHistory.length, 2);
    assert.equal(statusHistory[0].from_status, null);
    assert.equal(statusHistory[0].to_status, "confirmed");
    assert.equal(statusHistory[1].from_status, "confirmed");
    assert.equal(statusHistory[1].to_status, "cancelled");
    assert.equal(statusHistory[1].changed_by_user_id, userId);

    await assert.rejects(
      cancelMemberBooking({ bookingId: booking.booking_id, userId }),
      BookingCancellationConflictError,
    );
  } finally {
    await pool.query("DELETE FROM bookings WHERE user_id IN ($1, $2)", [userId, otherUserId]);
    await pool.query("DELETE FROM screenings WHERE screening_id IN ($1, $2)", [openScreeningId, fullScreeningId]);
    await pool.query("DELETE FROM users WHERE user_id IN ($1, $2)", [userId, otherUserId]);
  }
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
