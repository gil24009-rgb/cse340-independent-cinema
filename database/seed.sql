BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

TRUNCATE TABLE
  booking_status_history,
  reviews,
  contact_messages,
  bookings,
  screenings,
  films,
  users
RESTART IDENTITY CASCADE;

INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  role
)
VALUES
  (
    'owner@cinema.test',
    crypt('P@$$w0rd!', gen_salt('bf', 12)),
    'Mina',
    'Park',
    'owner'
  ),
  (
    'staff@cinema.test',
    crypt('P@$$w0rd!', gen_salt('bf', 12)),
    'Joon',
    'Lee',
    'staff'
  ),
  (
    'member@cinema.test',
    crypt('P@$$w0rd!', gen_salt('bf', 12)),
    'Sora',
    'Kim',
    'member'
  );

INSERT INTO films (
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
  is_featured
)
VALUES
  (
    'House of Hummingbird',
    'house-of-hummingbird',
    'Kim Bora',
    2018,
    'South Korea',
    138,
    '15+',
    'Drama',
    'A quiet coming-of-age story following a teenage girl in 1994 Seoul.',
    '/images/films/house-of-hummingbird.jpg',
    TRUE
  ),
  (
    'Little Forest',
    'little-forest',
    'Yim Soon-rye',
    2018,
    'South Korea',
    103,
    'All Ages',
    'Drama',
    'A young woman returns to her rural hometown and finds a new rhythm through food and the seasons.',
    '/images/films/little-forest.jpg',
    FALSE
  ),
  (
    'The Novelist''s Film',
    'the-novelists-film',
    'Hong Sang-soo',
    2022,
    'South Korea',
    92,
    '12+',
    'Drama',
    'A novelist reconnects with old acquaintances and begins an unexpected film project.',
    '/images/films/the-novelists-film.jpg',
    FALSE
  ),
  (
    'Microhabitat',
    'microhabitat',
    'Jeon Go-woon',
    2017,
    'South Korea',
    106,
    '15+',
    'Drama',
    'A housekeeper chooses her small daily pleasures over rising rent and visits old friends across Seoul.',
    '/images/films/microhabitat.jpg',
    FALSE
  );

INSERT INTO screenings (
  film_id,
  starts_at,
  capacity,
  ticket_price_cents,
  status,
  has_guest_talk,
  program_label
)
VALUES
  (
    (SELECT film_id FROM films WHERE slug = 'house-of-hummingbird'),
    CURRENT_DATE + INTERVAL '1 day 19 hours',
    60,
    1200,
    'scheduled',
    TRUE,
    'Director Focus'
  ),
  (
    (SELECT film_id FROM films WHERE slug = 'little-forest'),
    CURRENT_DATE + INTERVAL '2 days 17 hours 30 minutes',
    60,
    1000,
    'scheduled',
    FALSE,
    NULL
  ),
  (
    (SELECT film_id FROM films WHERE slug = 'the-novelists-film'),
    CURRENT_DATE + INTERVAL '3 days 20 hours',
    60,
    1000,
    'scheduled',
    FALSE,
    'Late Screening'
  ),
  (
    (SELECT film_id FROM films WHERE slug = 'microhabitat'),
    CURRENT_DATE - INTERVAL '3 days' + INTERVAL '18 hours',
    60,
    1000,
    'completed',
    FALSE,
    NULL
  ),
  (
    (SELECT film_id FROM films WHERE slug = 'house-of-hummingbird'),
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours',
    60,
    1200,
    'completed',
    TRUE,
    'Director Focus'
  );

INSERT INTO bookings (
  user_id,
  screening_id,
  status,
  booked_at,
  cancelled_at
)
VALUES
  (
    (SELECT user_id FROM users WHERE email = 'member@cinema.test'),
    (
      SELECT screening_id
      FROM screenings
      WHERE starts_at > CURRENT_TIMESTAMP
      ORDER BY starts_at
      LIMIT 1
    ),
    'confirmed',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    NULL
  ),
  (
    (SELECT user_id FROM users WHERE email = 'member@cinema.test'),
    (
      SELECT screening_id
      FROM screenings
      WHERE status = 'completed'
      ORDER BY starts_at
      LIMIT 1
    ),
    'completed',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    NULL
  ),
  (
    (SELECT user_id FROM users WHERE email = 'staff@cinema.test'),
    (
      SELECT screening_id
      FROM screenings
      WHERE starts_at > CURRENT_TIMESTAMP
      ORDER BY starts_at DESC
      LIMIT 1
    ),
    'cancelled',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
  );

INSERT INTO booking_status_history (
  booking_id,
  from_status,
  to_status,
  changed_by_user_id,
  note,
  changed_at
)
SELECT
  booking_id,
  NULL,
  'confirmed',
  user_id,
  'Booking created.',
  booked_at
FROM bookings;

INSERT INTO booking_status_history (
  booking_id,
  from_status,
  to_status,
  changed_by_user_id,
  note,
  changed_at
)
SELECT
  booking_id,
  'confirmed',
  'checked_in',
  (SELECT user_id FROM users WHERE email = 'staff@cinema.test'),
  'Member checked in at the front desk.',
  CURRENT_TIMESTAMP - INTERVAL '4 days'
FROM bookings
WHERE status = 'completed';

INSERT INTO booking_status_history (
  booking_id,
  from_status,
  to_status,
  changed_by_user_id,
  note,
  changed_at
)
SELECT
  booking_id,
  'checked_in',
  'completed',
  (SELECT user_id FROM users WHERE email = 'staff@cinema.test'),
  'Screening completed.',
  CURRENT_TIMESTAMP - INTERVAL '3 days'
FROM bookings
WHERE status = 'completed';

INSERT INTO booking_status_history (
  booking_id,
  from_status,
  to_status,
  changed_by_user_id,
  note,
  changed_at
)
SELECT
  booking_id,
  'confirmed',
  'cancelled',
  user_id,
  'Booking cancelled by member.',
  cancelled_at
FROM bookings
WHERE status = 'cancelled';

INSERT INTO reviews (
  user_id,
  film_id,
  rating,
  body
)
SELECT
  b.user_id,
  s.film_id,
  5,
  'A precise and quietly moving film that stayed with me after the screening.'
FROM bookings b
JOIN screenings s ON s.screening_id = b.screening_id
WHERE b.status = 'completed';

INSERT INTO contact_messages (
  user_id,
  name,
  email,
  subject,
  body,
  status
)
VALUES
  (
    NULL,
    'Daniel Cho',
    'daniel@example.com',
    'Group screening question',
    'Is it possible to reserve a future screening for a student group?',
    'new'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'member@cinema.test'),
    'Sora Kim',
    'member@cinema.test',
    'Accessibility information',
    'I would like more information about accessible seating and arrival time.',
    'in_progress'
  );

UPDATE contact_messages
SET
  assigned_to_user_id = (SELECT user_id FROM users WHERE email = 'staff@cinema.test'),
  staff_note = 'Confirming current accessibility guidance before replying.'
WHERE status = 'in_progress';

COMMIT;
