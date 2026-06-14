import { query } from "../config/database.js";

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
