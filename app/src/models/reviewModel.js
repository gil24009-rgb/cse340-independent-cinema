import { query } from "../config/database.js";

export async function findReviewById(reviewId) {
  const result = await query(
    `SELECT
      r.review_id,
      r.user_id,
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
