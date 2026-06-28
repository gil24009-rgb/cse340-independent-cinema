import { getPool, query } from "../config/database.js";

export class BookingDuplicateConflictError extends Error {
  constructor() {
    super("You already have a booking for this screening.");
    this.name = "BookingDuplicateConflictError";
    this.status = 409;
  }
}

export class BookingCapacityConflictError extends Error {
  constructor() {
    super("This screening is sold out.");
    this.name = "BookingCapacityConflictError";
    this.status = 409;
  }
}

export async function findBookingById(bookingId) {
  const result = await query(
    `SELECT
      b.booking_id,
      b.user_id,
      b.status,
      b.booked_at,
      b.cancelled_at,
      s.screening_id,
      s.starts_at,
      f.title AS film_title
    FROM bookings b
    JOIN screenings s ON s.screening_id = b.screening_id
    JOIN films f ON f.film_id = s.film_id
    WHERE b.booking_id = $1`,
    [bookingId],
  );

  return result.rows[0] || null;
}

export async function findBookingsByUserId(userId) {
  const result = await query(
    `SELECT
      b.booking_id,
      b.user_id,
      b.status,
      b.booked_at,
      b.cancelled_at,
      s.screening_id,
      s.starts_at,
      f.title AS film_title
    FROM bookings b
    JOIN screenings s ON s.screening_id = b.screening_id
    JOIN films f ON f.film_id = s.film_id
    WHERE b.user_id = $1
    ORDER BY
      CASE
        WHEN b.status = 'cancelled' THEN 2
        WHEN s.starts_at >= CURRENT_TIMESTAMP THEN 0
        ELSE 1
      END,
      CASE WHEN s.starts_at >= CURRENT_TIMESTAMP THEN s.starts_at END ASC,
      CASE WHEN s.starts_at < CURRENT_TIMESTAMP THEN s.starts_at END DESC,
      b.booking_id DESC`,
    [userId],
  );

  return result.rows;
}

function isDuplicateBookingViolation(error) {
  return error?.code === "23505" && error?.constraint === "bookings_user_screening_unique";
}

export async function createMemberBooking({ screeningId, userId }) {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const screeningResult = await client.query(
      `SELECT
        s.screening_id,
        s.capacity,
        s.starts_at,
        f.title AS film_title
      FROM screenings s
      JOIN films f ON f.film_id = s.film_id
      WHERE s.screening_id = $1
        AND s.status = 'scheduled'
        AND s.starts_at > CURRENT_TIMESTAMP
        AND f.is_archived = FALSE
      FOR UPDATE OF s`,
      [screeningId],
    );
    const screening = screeningResult.rows[0];

    if (!screening) {
      await client.query("ROLLBACK");
      return null;
    }

    const activeBookingResult = await client.query(
      `SELECT COUNT(*)::INTEGER AS active_booking_count
       FROM bookings
       WHERE screening_id = $1
         AND status IN ('confirmed', 'checked_in')`,
      [screeningId],
    );
    const activeBookingCount = activeBookingResult.rows[0]?.active_booking_count || 0;

    if (activeBookingCount >= screening.capacity) {
      await client.query("ROLLBACK");
      throw new BookingCapacityConflictError();
    }

    let booking;
    try {
      const bookingResult = await client.query(
        `INSERT INTO bookings (user_id, screening_id, status)
         VALUES ($1, $2, 'confirmed')
         RETURNING booking_id, user_id, screening_id, status, booked_at, cancelled_at`,
        [userId, screeningId],
      );
      booking = bookingResult.rows[0];
    } catch (error) {
      if (isDuplicateBookingViolation(error)) {
        await client.query("ROLLBACK");
        throw new BookingDuplicateConflictError();
      }

      throw error;
    }

    await client.query(
      `INSERT INTO booking_status_history (
        booking_id,
        from_status,
        to_status,
        changed_by_user_id,
        note
      )
      VALUES ($1, NULL, 'confirmed', $2, $3)`,
      [booking.booking_id, userId, "Booking created."],
    );

    await client.query("COMMIT");

    return {
      ...booking,
      film_title: screening.film_title,
      starts_at: screening.starts_at,
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original transaction error for the caller.
    }
    throw error;
  } finally {
    client.release();
  }
}
