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
import {
  ReviewDuplicateConflictError,
  ReviewEligibilityConflictError,
  createMemberReview,
  deleteMemberReview,
  findReviewableFilmsByUserId,
  findReviewsByUserId,
  findStaffReviewModerationQueue,
  setReviewVisibility,
  updateMemberReview,
} from "../src/models/reviewModel.js";
import {
  findStaffContactMessages,
  updateContactMessageStatus,
} from "../src/models/contactMessageModel.js";
import {
  OwnerUserAccessConflictError,
  findActiveUserById,
  findOwnerUsers,
  updateOwnerUserAccess,
} from "../src/models/userModel.js";

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

integrationTest("member reviews require completed bookings and preserve ownership", async () => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const email = `review-${suffix}@cinema.test`;
  const userResult = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, 'member')
     RETURNING user_id`,
    [email, "hash", "Review", "Member"],
  );
  const userId = userResult.rows[0].user_id;
  const filmResult = await pool.query("SELECT film_id FROM films WHERE is_archived = FALSE ORDER BY film_id LIMIT 1");
  const filmId = filmResult.rows[0].film_id;
  const otherFilmResult = await pool.query(
    "SELECT film_id FROM films WHERE is_archived = FALSE AND film_id <> $1 ORDER BY film_id DESC LIMIT 1",
    [filmId],
  );
  const otherFilmId = otherFilmResult.rows[0].film_id;
  const screeningResult = await pool.query(
    `INSERT INTO screenings (film_id, starts_at, capacity, ticket_price_cents, status)
     VALUES ($1, CURRENT_TIMESTAMP - INTERVAL '2 days', 60, 1200, 'completed')
     RETURNING screening_id`,
    [filmId],
  );
  const screeningId = screeningResult.rows[0].screening_id;
  const bookingResult = await pool.query(
    `INSERT INTO bookings (user_id, screening_id, status, booked_at)
     VALUES ($1, $2, 'completed', CURRENT_TIMESTAMP - INTERVAL '3 days')
     RETURNING booking_id`,
    [userId, screeningId],
  );
  const bookingId = bookingResult.rows[0].booking_id;

  try {
    const reviewableFilms = await findReviewableFilmsByUserId(userId);
    assert.equal(reviewableFilms.some((film) => film.film_id === filmId && film.review_id === null), true);

    await assert.rejects(
      createMemberReview({
        body: "This should be blocked.",
        filmId: otherFilmId,
        rating: 4,
        userId,
      }),
      ReviewEligibilityConflictError,
    );

    const review = await createMemberReview({
      body: "A measured review after a completed booking.",
      filmId,
      rating: 5,
      userId,
    });
    assert.equal(review.user_id, userId);
    assert.equal(review.film_id, filmId);
    assert.equal(review.rating, 5);

    const memberReviews = await findReviewsByUserId(userId);
    assert.equal(memberReviews.length, 1);
    assert.equal(memberReviews[0].body, "A measured review after a completed booking.");

    await assert.rejects(
      createMemberReview({
        body: "Duplicate review attempt.",
        filmId,
        rating: 4,
        userId,
      }),
      ReviewDuplicateConflictError,
    );

    const updated = await updateMemberReview({
      body: "Updated after a second look.",
      rating: 4,
      reviewId: review.review_id,
      userId,
    });
    assert.equal(updated.rating, 4);
    assert.equal(updated.body, "Updated after a second look.");

    const wrongOwnerUpdate = await updateMemberReview({
      body: "Wrong owner update.",
      rating: 1,
      reviewId: review.review_id,
      userId: userId + 9999,
    });
    assert.equal(wrongOwnerUpdate, null);

    const deleted = await deleteMemberReview({ reviewId: review.review_id, userId });
    assert.equal(deleted.review_id, review.review_id);

    const missingAfterDelete = await findReviewsByUserId(userId);
    assert.equal(missingAfterDelete.length, 0);
  } finally {
    await pool.query("DELETE FROM reviews WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM bookings WHERE booking_id = $1", [bookingId]);
    await pool.query("DELETE FROM screenings WHERE screening_id = $1", [screeningId]);
    await pool.query("DELETE FROM users WHERE user_id = $1", [userId]);
  }
});

integrationTest("staff review moderation and contact message processing update operational fields", async () => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const memberEmail = `moderation-member-${suffix}@cinema.test`;
  const staffResult = await pool.query("SELECT user_id FROM users WHERE role = 'staff' ORDER BY user_id LIMIT 1");
  const ownerResult = await pool.query("SELECT user_id FROM users WHERE role = 'owner' ORDER BY user_id LIMIT 1");
  const staffUserId = staffResult.rows[0].user_id;
  const ownerUserId = ownerResult.rows[0].user_id;
  const userResult = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, 'member')
     RETURNING user_id`,
    [memberEmail, "hash", "Moderation", "Member"],
  );
  const userId = userResult.rows[0].user_id;
  const filmResult = await pool.query("SELECT film_id FROM films WHERE is_archived = FALSE ORDER BY film_id LIMIT 1");
  const filmId = filmResult.rows[0].film_id;
  const reviewResult = await pool.query(
    `INSERT INTO reviews (user_id, film_id, rating, body)
     VALUES ($1, $2, 4, $3)
     RETURNING review_id`,
    [userId, filmId, "Needs a staff visibility decision."],
  );
  const reviewId = reviewResult.rows[0].review_id;
  const messageResult = await pool.query(
    `INSERT INTO contact_messages (user_id, name, email, subject, body)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING message_id`,
    [userId, "Moderation Member", memberEmail, "Private screening", "Can staff confirm a private screening option?"],
  );
  const messageId = messageResult.rows[0].message_id;

  try {
    const queue = await findStaffReviewModerationQueue();
    assert.equal(queue.some((review) => review.review_id === reviewId && review.member_email === memberEmail), true);

    const hidden = await setReviewVisibility({
      isVisible: false,
      moderatedByUserId: staffUserId,
      moderationNote: "Hidden while staff reviews tone.",
      reviewId,
    });
    assert.equal(hidden.is_visible, false);
    assert.equal(hidden.moderated_by_user_id, staffUserId);
    assert.equal(hidden.moderation_note, "Hidden while staff reviews tone.");

    const restored = await setReviewVisibility({
      isVisible: true,
      moderatedByUserId: ownerUserId,
      moderationNote: "Restored after review.",
      reviewId,
    });
    assert.equal(restored.is_visible, true);
    assert.equal(restored.moderated_by_user_id, ownerUserId);
    assert.equal(restored.moderation_note, "Restored after review.");

    const messages = await findStaffContactMessages();
    assert.equal(messages.some((message) => message.message_id === messageId && message.status === "new"), true);

    const inProgress = await updateContactMessageStatus({
      assignedToUserId: staffUserId,
      messageId,
      staffNote: "Checking the request.",
      status: "in_progress",
    });
    assert.equal(inProgress.status, "in_progress");
    assert.equal(inProgress.assigned_to_user_id, staffUserId);
    assert.equal(inProgress.staff_note, "Checking the request.");

    const closed = await updateContactMessageStatus({
      assignedToUserId: ownerUserId,
      messageId,
      staffNote: "Reply sent.",
      status: "closed",
    });
    assert.equal(closed.status, "closed");
    assert.equal(closed.assigned_to_user_id, ownerUserId);
    assert.equal(closed.staff_note, "Reply sent.");
  } finally {
    await pool.query("DELETE FROM contact_messages WHERE message_id = $1", [messageId]);
    await pool.query("DELETE FROM reviews WHERE review_id = $1", [reviewId]);
    await pool.query("DELETE FROM users WHERE user_id = $1", [userId]);
  }
});

integrationTest("owner user management updates roles and activation for current-user reload", async () => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const email = `owner-user-${suffix}@cinema.test`;
  const ownerResult = await pool.query("SELECT user_id FROM users WHERE role = 'owner' ORDER BY user_id LIMIT 1");
  const ownerUserId = ownerResult.rows[0].user_id;
  const userResult = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, 'staff')
     RETURNING user_id`,
    [email, "hash", "Owner", "Managed"],
  );
  const managedUserId = userResult.rows[0].user_id;

  try {
    const ownerUsers = await findOwnerUsers();
    assert.equal(ownerUsers.some((user) => user.user_id === managedUserId && user.role === "staff"), true);

    await assert.rejects(
      updateOwnerUserAccess({
        actingUserId: ownerUserId,
        isActive: false,
        role: "member",
        userId: ownerUserId,
      }),
      OwnerUserAccessConflictError,
    );

    const demoted = await updateOwnerUserAccess({
      actingUserId: ownerUserId,
      isActive: true,
      role: "member",
      userId: managedUserId,
    });
    assert.equal(demoted.role, "member");
    assert.equal(demoted.is_active, true);

    const reloadedDemotedUser = await findActiveUserById(managedUserId);
    assert.equal(reloadedDemotedUser.role, "member");

    const deactivated = await updateOwnerUserAccess({
      actingUserId: ownerUserId,
      isActive: false,
      role: "member",
      userId: managedUserId,
    });
    assert.equal(deactivated.is_active, false);

    const inactiveReload = await findActiveUserById(managedUserId);
    assert.equal(inactiveReload, null);
  } finally {
    await pool.query("DELETE FROM users WHERE user_id = $1", [managedUserId]);
  }
});

integrationTest("PostgreSQL session store creates, reads, and destroys a session", async () => {
  const PostgreSqlStore = connectPgSimple(session);
  const store = new PostgreSqlStore({
    createTableIfMissing: false,
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
