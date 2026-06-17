import { query } from "../config/database.js";

export async function findPublicFilms() {
  const result = await query(
    `SELECT
      f.film_id,
      f.title,
      f.slug,
      f.director,
      f.release_year,
      f.country,
      f.runtime_minutes,
      f.age_rating,
      f.genre,
      f.synopsis,
      f.poster_url,
      f.is_featured,
      (
        ARRAY_AGG(s.screening_id ORDER BY s.starts_at ASC)
        FILTER (WHERE s.screening_id IS NOT NULL)
      )[1]::INTEGER AS next_screening_id,
      COUNT(s.screening_id)::INTEGER AS upcoming_screening_count,
      MIN(s.starts_at) AS next_screening_at
    FROM films f
    LEFT JOIN screenings s
      ON s.film_id = f.film_id
      AND s.status = 'scheduled'
      AND s.starts_at > CURRENT_TIMESTAMP
    WHERE f.is_archived = FALSE
    GROUP BY f.film_id
    ORDER BY
      f.is_featured DESC,
      MIN(s.starts_at) ASC NULLS LAST,
      f.title ASC`,
  );

  return result.rows;
}

export async function findPublicFilmBySlug(slug) {
  const result = await query(
    `SELECT
      f.film_id,
      f.title,
      f.slug,
      f.director,
      f.release_year,
      f.country,
      f.runtime_minutes,
      f.age_rating,
      f.genre,
      f.synopsis,
      f.poster_url,
      f.is_featured,
      COUNT(s.screening_id)::INTEGER AS upcoming_screening_count,
      MIN(s.starts_at) AS next_screening_at
    FROM films f
    LEFT JOIN screenings s
      ON s.film_id = f.film_id
      AND s.status = 'scheduled'
      AND s.starts_at > CURRENT_TIMESTAMP
    WHERE f.slug = $1
      AND f.is_archived = FALSE
    GROUP BY f.film_id`,
    [slug],
  );

  return result.rows[0] || null;
}

export async function findOwnerFilms() {
  const result = await query(
    `SELECT
      f.film_id,
      f.title,
      f.slug,
      f.director,
      f.release_year,
      f.runtime_minutes,
      f.age_rating,
      f.genre,
      f.is_featured,
      f.is_archived,
      COUNT(s.screening_id) FILTER (
        WHERE s.status = 'scheduled'
          AND s.starts_at > CURRENT_TIMESTAMP
      )::INTEGER AS upcoming_screening_count,
      MIN(s.starts_at) FILTER (
        WHERE s.status = 'scheduled'
          AND s.starts_at > CURRENT_TIMESTAMP
      ) AS next_screening_at
    FROM films f
    LEFT JOIN screenings s ON s.film_id = f.film_id
    GROUP BY f.film_id
    ORDER BY f.is_archived ASC, f.title ASC`,
  );

  return result.rows;
}

export async function setFilmArchived(filmId, isArchived) {
  const result = await query(
    `UPDATE films
     SET is_archived = $2
     WHERE film_id = $1
     RETURNING film_id, title, slug, is_archived`,
    [filmId, isArchived],
  );

  return result.rows[0] || null;
}
