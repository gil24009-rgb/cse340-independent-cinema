import { getPool, query } from "../config/database.js";

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

export class OwnerUserAccessConflictError extends Error {
  constructor(message = "Owner account access cannot be changed that way.") {
    super(message);
    this.name = "OwnerUserAccessConflictError";
    this.status = 409;
  }
}

const allowedOwnerManagedRoles = new Set(["member", "staff", "owner"]);

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

export async function findOwnerUsers() {
  const result = await query(
    `SELECT
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.is_active,
      u.created_at,
      u.updated_at,
      COALESCE(bookings.booking_count, 0)::INTEGER AS booking_count,
      COALESCE(reviews.review_count, 0)::INTEGER AS review_count,
      COALESCE(messages.message_count, 0)::INTEGER AS contact_message_count
    FROM users u
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS booking_count
      FROM bookings
      GROUP BY user_id
    ) bookings ON bookings.user_id = u.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS review_count
      FROM reviews
      GROUP BY user_id
    ) reviews ON reviews.user_id = u.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS message_count
      FROM contact_messages
      GROUP BY user_id
    ) messages ON messages.user_id = u.user_id
    ORDER BY
      CASE u.role
        WHEN 'owner' THEN 1
        WHEN 'staff' THEN 2
        ELSE 3
      END,
      u.is_active DESC,
      u.last_name ASC,
      u.first_name ASC,
      u.user_id ASC`,
  );

  return result.rows;
}

export async function updateOwnerUserAccess({
  actingUserId,
  isActive,
  role,
  userId,
}) {
  if (!allowedOwnerManagedRoles.has(role)) {
    return null;
  }

  if (userId === actingUserId) {
    throw new OwnerUserAccessConflictError("Owners cannot change their own role or activation state.");
  }

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT user_id
       FROM users
       WHERE user_id = $1
       FOR UPDATE`,
      [userId],
    );

    if (!userResult.rowCount) {
      await client.query("ROLLBACK");
      return null;
    }

    const result = await client.query(
      `UPDATE users
       SET role = $2,
         is_active = $3
       WHERE user_id = $1
       RETURNING ${publicUserFields}`,
      [userId, role, isActive],
    );

    await client.query("COMMIT");
    return result.rows[0] || null;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original transaction error.
    }
    throw error;
  } finally {
    client.release();
  }
}
