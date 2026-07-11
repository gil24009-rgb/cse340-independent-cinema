import { query } from "../config/database.js";

export class ReviewEligibilityConflictError extends Error {
  constructor() {
    super("A completed booking is required before reviewing this film.");
    this.name = "ReviewEligibilityConflictError";
    this.status = 409;
  }
}

export class ReviewDuplicateConflictError extends Error {
  constructor() {
    super("You have already reviewed this film.");
    this.name = "ReviewDuplicateConflictError";
    this.status = 409;
  }
}

function isDuplicateReviewViolation(error) {
  return error?.code === "23505" && error?.constraint === "reviews_user_film_unique";
}

export async function findReviewById(reviewId) {
  const result = await query(
    `SELECT
      r.review_id,
      r.user_id,
      r.film_id,
      r.rating,
      r.body,
      r.is_visible,
      r.created_at,
      r.updated_at,
      f.title AS film_title
    FROM reviews r
    JOIN films f ON f.film_id = r.film_id
    WHERE r.review_id = $1`,
    [reviewId],
  );

  return result.rows[0] || null;
}

export async function findReviewsByUserId(userId) {
  const result = await query(
    `SELECT
      r.review_id,
      r.user_id,
      r.film_id,
      r.rating,
      r.body,
      r.is_visible,
      r.created_at,
      r.updated_at,
      f.title AS film_title
    FROM reviews r
    JOIN films f ON f.film_id = r.film_id
    WHERE r.user_id = $1
    ORDER BY r.updated_at DESC, r.review_id DESC`,
    [userId],
  );

  return result.rows;
}

export async function findStaffReviewModerationQueue() {
  const result = await query(
    `SELECT
      r.review_id,
      r.user_id,
      r.film_id,
      r.rating,
      r.body,
      r.is_visible,
      r.moderated_by_user_id,
      r.moderation_note,
      r.created_at,
      r.updated_at,
      f.title AS film_title,
      u.email AS member_email,
      u.first_name AS member_first_name,
      u.last_name AS member_last_name,
      moderator.email AS moderator_email,
      moderator.first_name AS moderator_first_name,
      moderator.last_name AS moderator_last_name
    FROM reviews r
    JOIN films f ON f.film_id = r.film_id
    JOIN users u ON u.user_id = r.user_id
    LEFT JOIN users moderator ON moderator.user_id = r.moderated_by_user_id
    ORDER BY r.is_visible DESC, r.updated_at DESC, r.review_id DESC`,
  );

  return result.rows;
}

export async function findReviewableFilmsByUserId(userId) {
  const result = await query(
    `SELECT DISTINCT
      f.film_id,
      f.title AS film_title,
      r.review_id
    FROM bookings b
    JOIN screenings s ON s.screening_id = b.screening_id
    JOIN films f ON f.film_id = s.film_id
    LEFT JOIN reviews r
      ON r.user_id = b.user_id
      AND r.film_id = f.film_id
    WHERE b.user_id = $1
      AND b.status = 'completed'
    ORDER BY f.title ASC`,
    [userId],
  );

  return result.rows;
}

export async function createMemberReview({ body, filmId, rating, userId }) {
  const eligibleResult = await query(
    `SELECT 1
     FROM bookings b
     JOIN screenings s ON s.screening_id = b.screening_id
     WHERE b.user_id = $1
       AND s.film_id = $2
       AND b.status = 'completed'
     LIMIT 1`,
    [userId, filmId],
  );

  if (!eligibleResult.rowCount) {
    throw new ReviewEligibilityConflictError();
  }

  try {
    const result = await query(
      `INSERT INTO reviews (user_id, film_id, rating, body)
       VALUES ($1, $2, $3, $4)
       RETURNING review_id, user_id, film_id, rating, body, is_visible, created_at, updated_at`,
      [userId, filmId, rating, body],
    );

    return result.rows[0];
  } catch (error) {
    if (isDuplicateReviewViolation(error)) {
      throw new ReviewDuplicateConflictError();
    }

    throw error;
  }
}

export async function updateMemberReview({ body, rating, reviewId, userId }) {
  const result = await query(
    `UPDATE reviews
     SET rating = $3,
       body = $4
     WHERE review_id = $1
       AND user_id = $2
     RETURNING review_id, user_id, film_id, rating, body, is_visible, created_at, updated_at`,
    [reviewId, userId, rating, body],
  );

  return result.rows[0] || null;
}

export async function deleteMemberReview({ reviewId, userId }) {
  const result = await query(
    `DELETE FROM reviews
     WHERE review_id = $1
       AND user_id = $2
     RETURNING review_id`,
    [reviewId, userId],
  );

  return result.rows[0] || null;
}

export async function setReviewVisibility({
  isVisible,
  moderationNote,
  moderatedByUserId,
  reviewId,
}) {
  const result = await query(
    `UPDATE reviews
     SET is_visible = $2,
       moderated_by_user_id = $3,
       moderation_note = $4
     WHERE review_id = $1
     RETURNING review_id, user_id, film_id, rating, body, is_visible, moderated_by_user_id, moderation_note, created_at, updated_at`,
    [reviewId, isVisible, moderatedByUserId, moderationNote],
  );

  return result.rows[0] || null;
}
