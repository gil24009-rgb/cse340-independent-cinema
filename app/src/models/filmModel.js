import { query } from "../config/database.js";

export class FilmSlugConflictError extends Error {
  constructor() {
    super("A film with that slug already exists.");
    this.name = "FilmSlugConflictError";
    this.status = 409;
  }
}

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

export async function findOwnerFilmById(filmId) {
  const result = await query(
    `SELECT
      film_id,
      title,
      slug,
      director,
      release_year,
      country,
      runtime_minutes,
      age_rating,
      genre,
      synopsis,
      poster_url,
      is_featured,
      is_archived
    FROM films
    WHERE film_id = $1`,
    [filmId],
  );

  return result.rows[0] || null;
}

function isUniqueSlugViolation(error) {
  return error?.code === "23505" && error?.constraint === "films_slug_key";
}

export async function createFilm(film) {
  try {
    const result = await query(
      `INSERT INTO films (
        title,
        slug,
        director,
        release_year,
        country,
        runtime_minutes,
        age_rating,
        genre,
        synopsis,
        poster_url,
        is_featured,
        is_archived
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING film_id, title, slug, is_archived`,
      [
        film.title,
        film.slug,
        film.director,
        film.releaseYear,
        film.country,
        film.runtimeMinutes,
        film.ageRating,
        film.genre,
        film.synopsis,
        film.posterUrl,
        film.isFeatured,
        film.isArchived,
      ],
    );

    return result.rows[0];
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      throw new FilmSlugConflictError();
    }

    throw error;
  }
}

export async function updateFilm(filmId, film) {
  try {
    const result = await query(
      `UPDATE films
       SET title = $2,
        slug = $3,
        director = $4,
        release_year = $5,
        country = $6,
        runtime_minutes = $7,
        age_rating = $8,
        genre = $9,
        synopsis = $10,
        poster_url = $11,
        is_featured = $12,
        is_archived = $13,
        updated_at = CURRENT_TIMESTAMP
       WHERE film_id = $1
       RETURNING film_id, title, slug, is_archived`,
      [
        filmId,
        film.title,
        film.slug,
        film.director,
        film.releaseYear,
        film.country,
        film.runtimeMinutes,
        film.ageRating,
        film.genre,
        film.synopsis,
        film.posterUrl,
        film.isFeatured,
        film.isArchived,
      ],
    );

    return result.rows[0] || null;
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      throw new FilmSlugConflictError();
    }

    throw error;
  }
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
