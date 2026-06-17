import { query } from "../config/database.js";

export async function createContactMessage({
  body,
  email,
  name,
  subject,
  userId = null,
}) {
  const result = await query(
    `INSERT INTO contact_messages (
      user_id,
      name,
      email,
      subject,
      body
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING message_id, status, created_at`,
    [userId, name, email, subject, body],
  );

  return result.rows[0];
}
