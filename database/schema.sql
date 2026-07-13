BEGIN;

CREATE TABLE users (
  user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_email_lowercase CHECK (email = LOWER(email)),
  CONSTRAINT users_email_not_blank CHECK (BTRIM(email) <> ''),
  CONSTRAINT users_first_name_not_blank CHECK (BTRIM(first_name) <> ''),
  CONSTRAINT users_last_name_not_blank CHECK (BTRIM(last_name) <> ''),
  CONSTRAINT users_role_allowed CHECK (role IN ('owner', 'staff', 'member'))
);

CREATE TABLE films (
  film_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  director VARCHAR(160) NOT NULL,
  release_year SMALLINT NOT NULL,
  country VARCHAR(120) NOT NULL,
  runtime_minutes SMALLINT NOT NULL,
  age_rating VARCHAR(20) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  synopsis TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  trailer_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT films_title_not_blank CHECK (BTRIM(title) <> ''),
  CONSTRAINT films_slug_not_blank CHECK (BTRIM(slug) <> ''),
  CONSTRAINT films_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT films_director_not_blank CHECK (BTRIM(director) <> ''),
  CONSTRAINT films_country_not_blank CHECK (BTRIM(country) <> ''),
  CONSTRAINT films_age_rating_not_blank CHECK (BTRIM(age_rating) <> ''),
  CONSTRAINT films_genre_not_blank CHECK (BTRIM(genre) <> ''),
  CONSTRAINT films_synopsis_not_blank CHECK (BTRIM(synopsis) <> ''),
  CONSTRAINT films_poster_url_not_blank CHECK (BTRIM(poster_url) <> ''),
  CONSTRAINT films_release_year_valid CHECK (release_year BETWEEN 1888 AND 2100),
  CONSTRAINT films_runtime_positive CHECK (runtime_minutes > 0)
);

CREATE TABLE screenings (
  screening_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  film_id INTEGER NOT NULL REFERENCES films(film_id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL UNIQUE,
  capacity SMALLINT NOT NULL DEFAULT 60,
  ticket_price_cents INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  has_guest_talk BOOLEAN NOT NULL DEFAULT FALSE,
  program_label VARCHAR(120),
  staff_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT screenings_capacity_positive CHECK (capacity > 0),
  CONSTRAINT screenings_ticket_price_valid CHECK (ticket_price_cents >= 0),
  CONSTRAINT screenings_status_allowed CHECK (
    status IN ('scheduled', 'cancelled', 'completed')
  ),
  CONSTRAINT screenings_program_label_not_blank CHECK (
    program_label IS NULL OR BTRIM(program_label) <> ''
  )
);

CREATE TABLE bookings (
  booking_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  screening_id INTEGER NOT NULL REFERENCES screenings(screening_id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  booked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bookings_user_screening_unique UNIQUE (user_id, screening_id),
  CONSTRAINT bookings_status_allowed CHECK (
    status IN ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')
  ),
  CONSTRAINT bookings_cancelled_at_matches_status CHECK (
    (status = 'cancelled' AND cancelled_at IS NOT NULL)
    OR (status <> 'cancelled' AND cancelled_at IS NULL)
  )
);

CREATE TABLE booking_status_history (
  history_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  from_status VARCHAR(20),
  to_status VARCHAR(20) NOT NULL,
  changed_by_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  note VARCHAR(500),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT booking_history_from_status_allowed CHECK (
    from_status IS NULL
    OR from_status IN ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')
  ),
  CONSTRAINT booking_history_to_status_allowed CHECK (
    to_status IN ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')
  ),
  CONSTRAINT booking_history_status_changed CHECK (
    from_status IS DISTINCT FROM to_status
  ),
  CONSTRAINT booking_history_note_not_blank CHECK (
    note IS NULL OR BTRIM(note) <> ''
  )
);

CREATE TABLE reviews (
  review_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  film_id INTEGER NOT NULL REFERENCES films(film_id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL,
  body TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  moderated_by_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  moderation_note VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reviews_user_film_unique UNIQUE (user_id, film_id),
  CONSTRAINT reviews_rating_valid CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_body_not_blank CHECK (BTRIM(body) <> ''),
  CONSTRAINT reviews_moderation_note_not_blank CHECK (
    moderation_note IS NULL OR BTRIM(moderation_note) <> ''
  )
);

CREATE TABLE contact_messages (
  message_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  assigned_to_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  staff_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT contact_messages_name_not_blank CHECK (BTRIM(name) <> ''),
  CONSTRAINT contact_messages_email_not_blank CHECK (BTRIM(email) <> ''),
  CONSTRAINT contact_messages_subject_not_blank CHECK (BTRIM(subject) <> ''),
  CONSTRAINT contact_messages_body_not_blank CHECK (BTRIM(body) <> ''),
  CONSTRAINT contact_messages_status_allowed CHECK (
    status IN ('new', 'in_progress', 'closed')
  ),
  CONSTRAINT contact_messages_staff_note_not_blank CHECK (
    staff_note IS NULL OR BTRIM(staff_note) <> ''
  )
);

CREATE TABLE user_sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  CONSTRAINT user_sessions_pkey PRIMARY KEY (sid)
);

CREATE INDEX screenings_film_starts_at_idx
  ON screenings (film_id, starts_at);

CREATE INDEX bookings_screening_status_idx
  ON bookings (screening_id, status);

CREATE INDEX bookings_user_status_idx
  ON bookings (user_id, status);

CREATE INDEX booking_status_history_booking_changed_at_idx
  ON booking_status_history (booking_id, changed_at);

CREATE INDEX reviews_film_visibility_created_at_idx
  ON reviews (film_id, is_visible, created_at DESC);

CREATE INDEX contact_messages_status_created_at_idx
  ON contact_messages (status, created_at);

CREATE INDEX user_sessions_expire_idx
  ON user_sessions (expire);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER films_set_updated_at
BEFORE UPDATE ON films
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER screenings_set_updated_at
BEFORE UPDATE ON screenings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER bookings_set_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER reviews_set_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER contact_messages_set_updated_at
BEFORE UPDATE ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
