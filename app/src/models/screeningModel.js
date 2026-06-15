import { query } from "../config/database.js";

export async function findPublicUpcomingScreenings() {
  const result = await query(
    `SELECT
      s.screening_id,
      s.starts_at,
      s.capacity,
      s.ticket_price_cents,
      s.has_guest_talk,
      s.program_label,
      f.film_id,
      f.slug AS film_slug,
      f.title AS film_title,
      f.director,
      f.runtime_minutes,
      f.age_rating,
      COUNT(b.booking_id) FILTER (
        WHERE b.status IN ('confirmed', 'checked_in')
      )::INTEGER AS active_booking_count,
      (
        s.capacity - COUNT(b.booking_id) FILTER (
          WHERE b.status IN ('confirmed', 'checked_in')
        )
      )::INTEGER AS remaining_capacity
    FROM screenings s
    JOIN films f ON f.film_id = s.film_id
    LEFT JOIN bookings b ON b.screening_id = s.screening_id
    WHERE s.status = 'scheduled'
      AND s.starts_at > CURRENT_TIMESTAMP
      AND f.is_archived = FALSE
    GROUP BY s.screening_id, f.film_id
    ORDER BY s.starts_at ASC`,
  );

  return result.rows;
}
