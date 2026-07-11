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

export async function findStaffContactMessages() {
  const result = await query(
    `SELECT
      cm.message_id,
      cm.user_id,
      cm.name,
      cm.email,
      cm.subject,
      cm.body,
      cm.status,
      cm.assigned_to_user_id,
      cm.staff_note,
      cm.created_at,
      cm.updated_at,
      requester.email AS requester_email,
      assignee.email AS assignee_email,
      assignee.first_name AS assignee_first_name,
      assignee.last_name AS assignee_last_name
    FROM contact_messages cm
    LEFT JOIN users requester ON requester.user_id = cm.user_id
    LEFT JOIN users assignee ON assignee.user_id = cm.assigned_to_user_id
    ORDER BY
      CASE cm.status
        WHEN 'new' THEN 1
        WHEN 'in_progress' THEN 2
        ELSE 3
      END,
      cm.updated_at DESC,
      cm.message_id DESC`,
  );

  return result.rows;
}

export async function updateContactMessageStatus({
  assignedToUserId,
  messageId,
  staffNote,
  status,
}) {
  const result = await query(
    `UPDATE contact_messages
     SET status = $2,
       assigned_to_user_id = $3,
       staff_note = $4
     WHERE message_id = $1
     RETURNING message_id, status, assigned_to_user_id, staff_note, updated_at`,
    [messageId, status, assignedToUserId, staffNote],
  );

  return result.rows[0] || null;
}
