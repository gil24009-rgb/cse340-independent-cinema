\pset pager off

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'films', COUNT(*) FROM films
UNION ALL
SELECT 'screenings', COUNT(*) FROM screenings
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'booking_status_history', COUNT(*) FROM booking_status_history
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM contact_messages
ORDER BY table_name;

SELECT
  role,
  COUNT(*) AS user_count
FROM users
GROUP BY role
ORDER BY role;

SELECT
  b.booking_id,
  b.status AS current_status,
  ARRAY_AGG(h.to_status ORDER BY h.changed_at) AS status_history
FROM bookings b
JOIN booking_status_history h ON h.booking_id = b.booking_id
GROUP BY b.booking_id, b.status
ORDER BY b.booking_id;

SELECT
  f.title,
  s.starts_at,
  s.capacity,
  COUNT(b.booking_id) FILTER (
    WHERE b.status IN ('confirmed', 'checked_in')
  ) AS active_bookings,
  s.capacity - COUNT(b.booking_id) FILTER (
    WHERE b.status IN ('confirmed', 'checked_in')
  ) AS remaining_capacity
FROM screenings s
JOIN films f ON f.film_id = s.film_id
LEFT JOIN bookings b ON b.screening_id = s.screening_id
GROUP BY f.title, s.screening_id
ORDER BY s.starts_at;
