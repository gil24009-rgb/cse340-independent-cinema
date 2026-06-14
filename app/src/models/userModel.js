import { query } from "../config/database.js";

const publicUserFields = `
  user_id,
  email,
  first_name,
  last_name,
  role,
  is_active
`;

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with that email already exists.");
    this.name = "DuplicateEmailError";
  }
}

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT ${publicUserFields}, password_hash
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
}

export async function createMemberUser({ email, firstName, lastName, passwordHash }) {
  try {
    const result = await query(
      `INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        role
      )
      VALUES ($1, $2, $3, $4, 'member')
      RETURNING ${publicUserFields}`,
      [email, passwordHash, firstName, lastName],
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505" && error.constraint === "users_email_key") {
      throw new DuplicateEmailError();
    }

    throw error;
  }
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
