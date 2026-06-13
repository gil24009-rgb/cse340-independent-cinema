import { query } from "../config/database.js";

const publicUserFields = `
  user_id,
  email,
  first_name,
  last_name,
  role,
  is_active
`;

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT ${publicUserFields}, password_hash
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
}

export async function findActiveUserById(userId) {
  const result = await query(
    `SELECT ${publicUserFields}
     FROM users
     WHERE user_id = $1
       AND is_active = TRUE`,
    [userId],
  );

  return result.rows[0] || null;
}
