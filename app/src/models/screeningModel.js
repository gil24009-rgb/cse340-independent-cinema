import { query } from "../config/database.js";

export class ScreeningStatusConflictError extends Error {
  constructor() {
    super("Screenings with active bookings cannot be cancelled in this management slice.");
    this.name = "ScreeningStatusConflictError";
    this.status = 409;
  }
}

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

export async function findPublicScreeningsByFilmId(filmId) {
  const result = await query(
    `SELECT
      s.screening_id,
      s.starts_at,
      s.capacity,
      s.ticket_price_cents,
      s.has_guest_talk,
      s.program_label,
      COUNT(b.booking_id) FILTER (
        WHERE b.status IN ('confirmed', 'checked_in')
      )::INTEGER AS active_booking_count,
      (
        s.capacity - COUNT(b.booking_id) FILTER (
          WHERE b.status IN ('confirmed', 'checked_in')
        )
      )::INTEGER AS remaining_capacity
    FROM screenings s
    LEFT JOIN bookings b ON b.screening_id = s.screening_id
    WHERE s.film_id = $1
      AND s.status = 'scheduled'
      AND s.starts_at > CURRENT_TIMESTAMP
    GROUP BY s.screening_id
    ORDER BY s.starts_at ASC`,
    [filmId],
  );

  return result.rows;
}

export async function findPublicScreeningById(screeningId) {
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
      f.release_year,
      f.country,
      f.runtime_minutes,
      f.age_rating,
      f.genre,
      f.synopsis,
      f.poster_url,
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
    WHERE s.screening_id = $1
      AND s.status = 'scheduled'
      AND s.starts_at > CURRENT_TIMESTAMP
      AND f.is_archived = FALSE
    GROUP BY s.screening_id, f.film_id`,
    [screeningId],
  );

  return result.rows[0] || null;
}

export async function findOwnerScreenings() {
  const result = await query(
    `SELECT
      s.screening_id,
      s.starts_at,
      s.capacity,
      s.ticket_price_cents,
      s.status,
      s.has_guest_talk,
      s.program_label,
      f.film_id,
      f.title AS film_title,
      f.slug AS film_slug,
      COUNT(b.booking_id) FILTER (
        WHERE b.status IN ('confirmed', 'checked_in')
      )::INTEGER AS active_booking_count
    FROM screenings s
    JOIN films f ON f.film_id = s.film_id
    LEFT JOIN bookings b ON b.screening_id = s.screening_id
    GROUP BY s.screening_id, f.film_id
    ORDER BY s.starts_at ASC`,
  );

  return result.rows;
}

export async function setScreeningStatus(screeningId, status) {
  const result = await query(
    `WITH active AS (
      SELECT COUNT(*)::INTEGER AS active_booking_count
      FROM bookings
      WHERE screening_id = $1
        AND status IN ('confirmed', 'checked_in')
    )
    UPDATE screenings
    SET status = $2
    FROM active
    WHERE screening_id = $1
      AND status IN ('scheduled', 'cancelled')
      AND $2 IN ('scheduled', 'cancelled')
      AND ($2 <> 'cancelled' OR active.active_booking_count = 0)
    RETURNING
      screenings.screening_id,
      screenings.status,
      active.active_booking_count`,
    [screeningId, status],
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  const current = await query(
    `SELECT
      s.screening_id,
      s.status,
      COUNT(b.booking_id) FILTER (
        WHERE b.status IN ('confirmed', 'checked_in')
      )::INTEGER AS active_booking_count
    FROM screenings s
    LEFT JOIN bookings b ON b.screening_id = s.screening_id
    WHERE s.screening_id = $1
    GROUP BY s.screening_id`,
    [screeningId],
  );

  const screening = current.rows[0];

  if (screening && status === "cancelled" && screening.active_booking_count > 0) {
    throw new ScreeningStatusConflictError();
  }

  return null;
}
