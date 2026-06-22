import { query } from "../config/database.js";

export class ScreeningStatusConflictError extends Error {
  constructor() {
    super("Screenings with active bookings cannot be cancelled in this management slice.");
    this.name = "ScreeningStatusConflictError";
    this.status = 409;
  }
}

export class ScreeningScheduleConflictError extends Error {
  constructor(message = "A screening already exists at that start time.") {
    super(message);
    this.name = "ScreeningScheduleConflictError";
    this.status = 409;
  }
}

export class ScreeningCapacityConflictError extends Error {
  constructor() {
    super("Capacity cannot be lower than the active booking count.");
    this.name = "ScreeningCapacityConflictError";
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

export async function findOwnerScreeningById(screeningId) {
  const result = await query(
    `SELECT
      s.screening_id,
      s.film_id,
      s.starts_at,
      s.capacity,
      s.ticket_price_cents,
      s.status,
      s.has_guest_talk,
      s.program_label,
      COUNT(b.booking_id) FILTER (
        WHERE b.status IN ('confirmed', 'checked_in')
      )::INTEGER AS active_booking_count
    FROM screenings s
    LEFT JOIN bookings b ON b.screening_id = s.screening_id
    WHERE s.screening_id = $1
    GROUP BY s.screening_id`,
    [screeningId],
  );

  return result.rows[0] || null;
}

export async function findOwnerScreeningFilmOptions() {
  const result = await query(
    `SELECT film_id, title
     FROM films
     WHERE is_archived = FALSE
     ORDER BY title ASC`,
  );

  return result.rows;
}

function isUniqueStartTimeViolation(error) {
  return error?.code === "23505" && error?.constraint === "screenings_starts_at_key";
}

export async function createScreening(screening) {
  try {
    const result = await query(
      `INSERT INTO screenings (
        film_id,
        starts_at,
        capacity,
        ticket_price_cents,
        status,
        has_guest_talk,
        program_label
      )
      SELECT $1, $2, $3, $4, $5, $6, $7
      WHERE EXISTS (
        SELECT 1
        FROM films
        WHERE film_id = $1
          AND is_archived = FALSE
      )
      RETURNING screening_id, film_id, starts_at, status`,
      [
        screening.filmId,
        screening.startsAt,
        screening.capacity,
        screening.ticketPriceCents,
        screening.status,
        screening.hasGuestTalk,
        screening.programLabel || null,
      ],
    );

    return result.rows[0] || null;
  } catch (error) {
    if (isUniqueStartTimeViolation(error)) {
      throw new ScreeningScheduleConflictError();
    }

    throw error;
  }
}

export async function updateScreening(screeningId, screening) {
  try {
    const result = await query(
      `WITH active AS (
        SELECT COUNT(*)::INTEGER AS active_booking_count
        FROM bookings
        WHERE screening_id = $1
          AND status IN ('confirmed', 'checked_in')
      )
      UPDATE screenings
      SET film_id = $2,
        starts_at = $3,
        capacity = $4,
        ticket_price_cents = $5,
        status = $6,
        has_guest_talk = $7,
        program_label = $8,
        updated_at = CURRENT_TIMESTAMP
      FROM active
      WHERE screening_id = $1
        AND screenings.status IN ('scheduled', 'cancelled')
        AND $6 IN ('scheduled', 'cancelled')
        AND active.active_booking_count <= $4
        AND ($6 <> 'cancelled' OR active.active_booking_count = 0)
        AND EXISTS (
          SELECT 1
          FROM films
          WHERE film_id = $2
            AND is_archived = FALSE
        )
      RETURNING
        screenings.screening_id,
        screenings.film_id,
        screenings.starts_at,
        screenings.capacity,
        screenings.status,
        active.active_booking_count`,
      [
        screeningId,
        screening.filmId,
        screening.startsAt,
        screening.capacity,
        screening.ticketPriceCents,
        screening.status,
        screening.hasGuestTalk,
        screening.programLabel || null,
      ],
    );

    if (result.rows[0]) {
      return result.rows[0];
    }

    const current = await findOwnerScreeningById(screeningId);

    if (!current) {
      return null;
    }

    if (current.status !== "scheduled" && current.status !== "cancelled") {
      return null;
    }

    if (screening.status === "cancelled" && current.active_booking_count > 0) {
      throw new ScreeningStatusConflictError();
    }

    if (current.active_booking_count > screening.capacity) {
      throw new ScreeningCapacityConflictError();
    }

    return null;
  } catch (error) {
    if (isUniqueStartTimeViolation(error)) {
      throw new ScreeningScheduleConflictError();
    }

    throw error;
  }
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
