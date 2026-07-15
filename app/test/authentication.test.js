import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { createApp } from "../src/app.js";

const users = [
  {
    email: "member@cinema.test",
    first_name: "Sora",
    is_active: true,
    last_name: "Kim",
    password_hash: "valid-password",
    role: "member",
    user_id: 1,
  },
  {
    email: "staff@cinema.test",
    first_name: "Joon",
    is_active: true,
    last_name: "Lee",
    password_hash: "valid-password",
    role: "staff",
    user_id: 2,
  },
  {
    email: "owner@cinema.test",
    first_name: "Mina",
    is_active: true,
    last_name: "Park",
    password_hash: "valid-password",
    role: "owner",
    user_id: 3,
  },
];
const bookings = [
  {
    booked_at: "2026-06-10T18:30:00.000Z",
    booking_id: 1,
    cancelled_at: null,
    film_title: "House of Hummingbird",
    screening_id: 10,
    starts_at: "2026-06-15T01:00:00.000Z",
    status: "confirmed",
    user_id: 1,
  },
  {
    booked_at: "2026-06-02T18:30:00.000Z",
    booking_id: 2,
    cancelled_at: null,
    film_title: "Microhabitat",
    screening_id: 11,
    starts_at: "2026-06-08T01:00:00.000Z",
    status: "completed",
    user_id: 1,
  },
  {
    booked_at: "2026-06-09T18:30:00.000Z",
    booking_id: 3,
    cancelled_at: "2026-06-10T18:30:00.000Z",
    film_title: "Little Forest",
    screening_id: 12,
    starts_at: "2026-06-16T01:00:00.000Z",
    status: "cancelled",
    user_id: 4,
  },
];
const bookingStatusHistory = [
  {
    booking_id: 1,
    changed_at: "2026-06-10T18:30:00.000Z",
    changed_by_first_name: "Sora",
    changed_by_last_name: "Kim",
    changed_by_role: "member",
    changed_by_user_id: 1,
    from_status: null,
    history_id: 1,
    note: "Booking created.",
    to_status: "confirmed",
  },
  {
    booking_id: 2,
    changed_at: "2026-06-02T18:30:00.000Z",
    changed_by_first_name: "Sora",
    changed_by_last_name: "Kim",
    changed_by_role: "member",
    changed_by_user_id: 1,
    from_status: null,
    history_id: 2,
    note: "Booking created.",
    to_status: "confirmed",
  },
  {
    booking_id: 2,
    changed_at: "2026-06-08T03:30:00.000Z",
    changed_by_first_name: "Joon",
    changed_by_last_name: "Lee",
    changed_by_role: "staff",
    changed_by_user_id: 2,
    from_status: "confirmed",
    history_id: 3,
    note: "Screening completed.",
    to_status: "completed",
  },
];
const reviews = [
  {
    body: "A precise and quietly moving film that stayed with me after the screening.",
    created_at: "2026-06-09T18:30:00.000Z",
    film_id: 3,
    film_title: "Microhabitat",
    is_visible: true,
    moderated_by_user_id: null,
    moderation_note: null,
    rating: 5,
    review_id: 1,
    updated_at: "2026-06-09T18:30:00.000Z",
    user_id: 1,
  },
  {
    body: "Another member review.",
    created_at: "2026-06-11T18:30:00.000Z",
    film_id: 2,
    film_title: "Little Forest",
    is_visible: true,
    moderated_by_user_id: null,
    moderation_note: null,
    rating: 4,
    review_id: 2,
    updated_at: "2026-06-11T18:30:00.000Z",
    user_id: 4,
  },
];
const contactMessages = [
  {
    assigned_to_user_id: null,
    body: "Is it possible to reserve a future screening for a student group?",
    created_at: "2026-06-12T18:30:00.000Z",
    email: "daniel@example.com",
    message_id: 1,
    name: "Daniel Cho",
    requester_email: null,
    staff_note: null,
    status: "new",
    subject: "Group screening question",
    updated_at: "2026-06-12T18:30:00.000Z",
    user_id: null,
  },
  {
    assigned_to_user_id: 2,
    body: "I would like more information about accessible seating and arrival time.",
    created_at: "2026-06-13T18:30:00.000Z",
    email: "member@cinema.test",
    message_id: 2,
    name: "Sora Kim",
    requester_email: "member@cinema.test",
    staff_note: "Confirming current accessibility guidance before replying.",
    status: "in_progress",
    subject: "Accessibility information",
    updated_at: "2026-06-13T19:30:00.000Z",
    user_id: 1,
  },
];
const films = [
  {
    age_rating: "15+",
    country: "South Korea",
    director: "Kim Bora",
    film_id: 1,
    genre: "Drama",
    is_archived: false,
    is_featured: true,
    next_screening_at: "2026-06-20T01:00:00.000Z",
    release_year: 2018,
    runtime_minutes: 138,
    slug: "house-of-hummingbird",
    synopsis: "A quiet coming-of-age story following a teenage girl in 1994 Seoul.",
    poster_url: "/images/films/house-of-hummingbird.jpg",
    title: "House of Hummingbird",
    upcoming_screening_count: 2,
  },
  {
    age_rating: "12+",
    country: "South Korea",
    director: "Yim Soon-rye",
    film_id: 2,
    genre: "Drama",
    is_archived: true,
    is_featured: false,
    next_screening_at: null,
    release_year: 2018,
    runtime_minutes: 103,
    slug: "little-forest",
    synopsis: "A young woman returns to her rural hometown and finds a new rhythm.",
    poster_url: "/images/films/little-forest.jpg",
    title: "Little Forest",
    upcoming_screening_count: 0,
  },
  {
    age_rating: "15+",
    country: "South Korea",
    director: "Jeon Go-woon",
    film_id: 3,
    genre: "Drama",
    is_archived: false,
    is_featured: false,
    next_screening_at: null,
    release_year: 2017,
    runtime_minutes: 106,
    slug: "microhabitat",
    synopsis: "A housekeeper chooses her small daily pleasures over rising rent.",
    poster_url: "/images/films/microhabitat.jpg",
    title: "Microhabitat",
    upcoming_screening_count: 0,
  },
];
const screenings = [
  {
    active_booking_count: 2,
    capacity: 60,
    film_slug: "house-of-hummingbird",
    film_title: "House of Hummingbird",
    has_guest_talk: true,
    program_label: "Director Focus",
    screening_id: 1,
    starts_at: "2026-06-20T01:00:00.000Z",
    status: "scheduled",
    ticket_price_cents: 1200,
  },
  {
    active_booking_count: 0,
    capacity: 60,
    film_slug: "little-forest",
    film_title: "Little Forest",
    has_guest_talk: false,
    program_label: "Regular screening",
    screening_id: 2,
    starts_at: "2026-06-21T01:00:00.000Z",
    status: "scheduled",
    ticket_price_cents: 1200,
  },
  {
    active_booking_count: 0,
    capacity: 60,
    film_slug: "microhabitat",
    film_title: "Microhabitat",
    has_guest_talk: false,
    program_label: "Regular screening",
    screening_id: 3,
    starts_at: "2026-06-11T01:00:00.000Z",
    status: "completed",
    ticket_price_cents: 1200,
  },
];

let server;
let baseUrl;
let nextFilmId = 4;
let nextHistoryId = 4;
let nextReviewId = 4;
let nextScreeningId = 4;
let nextUserId = 5;

function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}

function findActiveUserById(userId) {
  return users.find((user) => user.user_id === userId && user.is_active) || null;
}

async function findOwnerUsers() {
  return users.map((user) => ({
    ...user,
    booking_count: bookings.filter((booking) => booking.user_id === user.user_id).length,
    contact_message_count: contactMessages.filter((message) => message.user_id === user.user_id).length,
    created_at: user.created_at || "2026-06-01T18:00:00.000Z",
    review_count: reviews.filter((review) => review.user_id === user.user_id).length,
    updated_at: user.updated_at || "2026-06-01T18:00:00.000Z",
  }));
}

async function updateOwnerUserAccess({
  actingUserId,
  isActive,
  role,
  userId,
}) {
  const user = users.find((candidate) => candidate.user_id === userId);

  if (!["member", "staff", "owner"].includes(role)) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (userId === actingUserId) {
    const error = new Error("Owners cannot change their own role or activation state.");
    error.name = "OwnerUserAccessConflictError";
    error.status = 409;
    throw error;
  }

  user.role = role;
  user.is_active = isActive;
  user.updated_at = "2026-07-12T21:00:00.000Z";
  return user;
}

async function createMemberUser({ email, firstName, lastName, passwordHash }) {
  if (findUserByEmail(email)) {
    const error = new Error("duplicate email");
    error.code = "23505";
    error.constraint = "users_email_key";
    throw error;
  }

  const user = {
    email,
    first_name: firstName,
    is_active: true,
    last_name: lastName,
    password_hash: passwordHash,
    role: "member",
    user_id: nextUserId,
  };

  nextUserId += 1;
  users.push(user);
  return user;
}

async function findBookingById(bookingId) {
  const booking = bookings.find((candidate) => candidate.booking_id === bookingId);

  if (!booking) {
    return null;
  }

  return {
    ...booking,
    can_cancel: booking.status === "confirmed" && new Date(booking.starts_at) > new Date(),
  };
}

async function findBookingStatusHistoryByBookingId(bookingId) {
  return bookingStatusHistory
    .filter((entry) => entry.booking_id === bookingId)
    .sort((first, second) => first.changed_at.localeCompare(second.changed_at) || first.history_id - second.history_id);
}

async function findBookingsByUserId(userId) {
  return bookings.filter((booking) => booking.user_id === userId);
}

async function findStaffOperationalBookings() {
  return bookings.map((booking) => {
    const user = users.find((candidate) => candidate.user_id === booking.user_id);

    return {
      ...booking,
      member_email: user?.email || "unknown@cinema.test",
      member_first_name: user?.first_name || "Unknown",
      member_last_name: user?.last_name || "Member",
    };
  });
}

function createBookingCancellationConflict() {
  const error = new Error("Only confirmed upcoming bookings can be cancelled.");
  error.name = "BookingCancellationConflictError";
  error.status = 409;
  return error;
}

function createBookingStatusTransitionConflict() {
  const error = new Error("That booking cannot move to the requested status.");
  error.name = "BookingStatusTransitionConflictError";
  error.status = 409;
  return error;
}

const staffAllowedTransitions = {
  checked_in: new Set(["completed", "no_show"]),
  confirmed: new Set(["checked_in", "no_show"]),
};

async function transitionStaffBookingStatus({ bookingId, changedByUserId, toStatus }) {
  const booking = bookings.find((candidate) => candidate.booking_id === bookingId);

  if (!booking) {
    return null;
  }

  if (!staffAllowedTransitions[booking.status]?.has(toStatus)) {
    throw createBookingStatusTransitionConflict();
  }

  const fromStatus = booking.status;
  booking.status = toStatus;
  booking.cancelled_at = null;
  bookingStatusHistory.push({
    booking_id: booking.booking_id,
    changed_at: "2026-07-01T21:00:00.000Z",
    changed_by_first_name: "Joon",
    changed_by_last_name: "Lee",
    changed_by_role: "staff",
    changed_by_user_id: changedByUserId,
    from_status: fromStatus,
    history_id: nextHistoryId,
    note: `Staff marked booking as ${toStatus.replaceAll("_", " ")}.`,
    to_status: toStatus,
  });
  nextHistoryId += 1;

  return booking;
}

async function cancelMemberBooking({ bookingId, userId }) {
  const booking = bookings.find((candidate) => candidate.booking_id === bookingId && candidate.user_id === userId);

  if (!booking) {
    return null;
  }

  if (booking.status !== "confirmed" || new Date(booking.starts_at) <= new Date()) {
    throw createBookingCancellationConflict();
  }

  booking.status = "cancelled";
  booking.cancelled_at = "2026-06-30T21:00:00.000Z";
  bookingStatusHistory.push({
    booking_id: booking.booking_id,
    changed_at: "2026-06-30T21:00:00.000Z",
    changed_by_first_name: "Sora",
    changed_by_last_name: "Kim",
    changed_by_role: "member",
    changed_by_user_id: userId,
    from_status: "confirmed",
    history_id: nextHistoryId,
    note: "Booking cancelled by member.",
    to_status: "cancelled",
  });
  nextHistoryId += 1;

  return booking;
}

async function findReviewById(reviewId) {
  return reviews.find((review) => review.review_id === reviewId) || null;
}

function filmForCompletedBooking(booking) {
  return films.find((film) => film.title === booking.film_title) || null;
}

async function findReviewsByUserId(userId) {
  return reviews.filter((review) => review.user_id === userId);
}

async function findReviewableFilmsByUserId(userId) {
  const completedFilms = bookings
    .filter((booking) => booking.user_id === userId && booking.status === "completed")
    .map(filmForCompletedBooking)
    .filter(Boolean);
  const uniqueFilms = new Map();

  for (const film of completedFilms) {
    uniqueFilms.set(film.film_id, film);
  }

  return Array.from(uniqueFilms.values()).map((film) => ({
    film_id: film.film_id,
    film_title: film.title,
    review_id: reviews.find((review) => review.user_id === userId && review.film_id === film.film_id)?.review_id || null,
  }));
}

function createReviewConflict(name, message) {
  const error = new Error(message);
  error.name = name;
  error.status = 409;
  return error;
}

function memberCanReviewFilm(userId, filmId) {
  return bookings.some((booking) => {
    const film = filmForCompletedBooking(booking);
    return booking.user_id === userId && booking.status === "completed" && film?.film_id === filmId;
  });
}

async function createMemberReview({ body, filmId, rating, userId }) {
  if (!memberCanReviewFilm(userId, filmId)) {
    throw createReviewConflict("ReviewEligibilityConflictError", "A completed booking is required before reviewing this film.");
  }

  if (reviews.some((review) => review.user_id === userId && review.film_id === filmId)) {
    throw createReviewConflict("ReviewDuplicateConflictError", "You have already reviewed this film.");
  }

  const film = films.find((candidate) => candidate.film_id === filmId);
  const review = {
    body,
    created_at: "2026-07-10T21:00:00.000Z",
    film_id: filmId,
    film_title: film?.title || "Unknown Film",
    is_visible: true,
    rating,
    review_id: nextReviewId,
    updated_at: "2026-07-10T21:00:00.000Z",
    user_id: userId,
  };

  nextReviewId += 1;
  reviews.push(review);
  return review;
}

async function updateMemberReview({ body, rating, reviewId, userId }) {
  const review = reviews.find((candidate) => candidate.review_id === reviewId && candidate.user_id === userId);

  if (!review) {
    return null;
  }

  review.body = body;
  review.rating = rating;
  review.updated_at = "2026-07-10T21:10:00.000Z";
  return review;
}

async function deleteMemberReview({ reviewId, userId }) {
  const index = reviews.findIndex((candidate) => candidate.review_id === reviewId && candidate.user_id === userId);

  if (index < 0) {
    return null;
  }

  const [deleted] = reviews.splice(index, 1);
  return deleted;
}

async function findStaffReviewModerationQueue() {
  return reviews.map((review) => {
    const member = users.find((user) => user.user_id === review.user_id);
    const moderator = users.find((user) => user.user_id === review.moderated_by_user_id);

    return {
      ...review,
      member_email: member?.email || "other@cinema.test",
      member_first_name: member?.first_name || "Other",
      member_last_name: member?.last_name || "Member",
      moderator_email: moderator?.email || null,
      moderator_first_name: moderator?.first_name || null,
      moderator_last_name: moderator?.last_name || null,
    };
  });
}

async function setReviewVisibility({
  isVisible,
  moderatedByUserId,
  moderationNote,
  reviewId,
}) {
  const review = reviews.find((candidate) => candidate.review_id === reviewId);

  if (!review) {
    return null;
  }

  review.is_visible = isVisible;
  review.moderated_by_user_id = moderatedByUserId;
  review.moderation_note = moderationNote;
  review.updated_at = "2026-07-11T21:00:00.000Z";
  return review;
}

async function findStaffContactMessages() {
  return contactMessages.map((message) => {
    const assignee = users.find((user) => user.user_id === message.assigned_to_user_id);

    return {
      ...message,
      assignee_email: assignee?.email || null,
      assignee_first_name: assignee?.first_name || null,
      assignee_last_name: assignee?.last_name || null,
    };
  });
}

async function updateContactMessageStatus({
  assignedToUserId,
  messageId,
  staffNote,
  status,
}) {
  const message = contactMessages.find((candidate) => candidate.message_id === messageId);

  if (!message) {
    return null;
  }

  message.assigned_to_user_id = assignedToUserId;
  message.staff_note = staffNote;
  message.status = status;
  message.updated_at = "2026-07-11T21:05:00.000Z";
  return message;
}

async function findOwnerFilms() {
  return films;
}

async function findOwnerFilmById(filmId) {
  return films.find((candidate) => candidate.film_id === filmId) || null;
}

function duplicateFilmSlug(slug, currentFilmId = null) {
  return films.some((candidate) => candidate.slug === slug && candidate.film_id !== currentFilmId);
}

function createDuplicateSlugError() {
  const error = new Error("A film with that slug already exists.");
  error.name = "FilmSlugConflictError";
  error.status = 409;
  return error;
}

async function createFilm(film) {
  if (duplicateFilmSlug(film.slug)) {
    throw createDuplicateSlugError();
  }

  const created = {
    age_rating: film.ageRating,
    country: film.country,
    director: film.director,
    film_id: nextFilmId,
    genre: film.genre,
    is_archived: film.isArchived,
    is_featured: film.isFeatured,
    next_screening_at: null,
    poster_url: film.posterUrl,
    release_year: film.releaseYear,
    runtime_minutes: film.runtimeMinutes,
    slug: film.slug,
    synopsis: film.synopsis,
    title: film.title,
    upcoming_screening_count: 0,
  };

  nextFilmId += 1;
  films.push(created);
  return created;
}

async function updateFilm(filmId, film) {
  const existing = films.find((candidate) => candidate.film_id === filmId);

  if (!existing) {
    return null;
  }

  if (duplicateFilmSlug(film.slug, filmId)) {
    throw createDuplicateSlugError();
  }

  existing.age_rating = film.ageRating;
  existing.country = film.country;
  existing.director = film.director;
  existing.genre = film.genre;
  existing.is_archived = film.isArchived;
  existing.is_featured = film.isFeatured;
  existing.poster_url = film.posterUrl;
  existing.release_year = film.releaseYear;
  existing.runtime_minutes = film.runtimeMinutes;
  existing.slug = film.slug;
  existing.synopsis = film.synopsis;
  existing.title = film.title;

  return existing;
}

async function setFilmArchived(filmId, isArchived) {
  const film = films.find((candidate) => candidate.film_id === filmId);

  if (!film) {
    return null;
  }

  film.is_archived = isArchived;
  return film;
}

async function findOwnerScreenings() {
  return screenings;
}

async function findOwnerScreeningById(screeningId) {
  return screenings.find((candidate) => candidate.screening_id === screeningId) || null;
}

async function findOwnerScreeningFilmOptions() {
  return films.filter((film) => !film.is_archived).map((film) => ({
    film_id: film.film_id,
    title: film.title,
  }));
}

function filmTitleForId(filmId) {
  return films.find((film) => film.film_id === filmId)?.title || "Unknown Film";
}

function filmSlugForId(filmId) {
  return films.find((film) => film.film_id === filmId)?.slug || "unknown-film";
}

function activeFilmExists(filmId) {
  return films.some((film) => film.film_id === filmId && !film.is_archived);
}

function duplicateScreeningStart(startsAt, currentScreeningId = null) {
  const nextStart = new Date(startsAt).toISOString();
  return screenings.some((screening) => {
    return new Date(screening.starts_at).toISOString() === nextStart && screening.screening_id !== currentScreeningId;
  });
}

function createScreeningConflict(name, message) {
  const error = new Error(message);
  error.name = name;
  error.status = 409;
  return error;
}

async function createScreening(screening) {
  if (!activeFilmExists(screening.filmId)) {
    return null;
  }

  if (duplicateScreeningStart(screening.startsAt)) {
    throw createScreeningConflict("ScreeningScheduleConflictError", "A screening already exists at that start time.");
  }

  const created = {
    active_booking_count: 0,
    capacity: screening.capacity,
    film_id: screening.filmId,
    film_slug: filmSlugForId(screening.filmId),
    film_title: filmTitleForId(screening.filmId),
    has_guest_talk: screening.hasGuestTalk,
    program_label: screening.programLabel || null,
    screening_id: nextScreeningId,
    starts_at: screening.startsAt.toISOString(),
    status: screening.status,
    ticket_price_cents: screening.ticketPriceCents,
  };

  nextScreeningId += 1;
  screenings.push(created);
  return created;
}

async function updateScreening(screeningId, screening) {
  const existing = screenings.find((candidate) => candidate.screening_id === screeningId);

  if (!existing) {
    return null;
  }

  if (existing.status !== "scheduled" && existing.status !== "cancelled") {
    return null;
  }

  if (!activeFilmExists(screening.filmId)) {
    return null;
  }

  if (duplicateScreeningStart(screening.startsAt, screeningId)) {
    throw createScreeningConflict("ScreeningScheduleConflictError", "A screening already exists at that start time.");
  }

  if (existing.active_booking_count > screening.capacity) {
    throw createScreeningConflict("ScreeningCapacityConflictError", "Capacity cannot be lower than the active booking count.");
  }

  if (screening.status === "cancelled" && existing.active_booking_count > 0) {
    throw createScreeningConflict("ScreeningStatusConflictError", "Screenings with active bookings cannot be cancelled in this management slice.");
  }

  existing.capacity = screening.capacity;
  existing.film_id = screening.filmId;
  existing.film_slug = filmSlugForId(screening.filmId);
  existing.film_title = filmTitleForId(screening.filmId);
  existing.has_guest_talk = screening.hasGuestTalk;
  existing.program_label = screening.programLabel || null;
  existing.starts_at = screening.startsAt.toISOString();
  existing.status = screening.status;
  existing.ticket_price_cents = screening.ticketPriceCents;

  return existing;
}

async function setScreeningStatus(screeningId, status) {
  const screening = screenings.find((candidate) => candidate.screening_id === screeningId);

  if (!screening) {
    return null;
  }

  if (status === "cancelled" && screening.active_booking_count > 0) {
    const error = new Error("Screenings with active bookings cannot be cancelled in this management slice.");
    error.status = 409;
    throw error;
  }

  if (screening.status !== "scheduled" && screening.status !== "cancelled") {
    return null;
  }

  screening.status = status;
  return screening;
}

function cookieFrom(response) {
  return response.headers.get("set-cookie")?.split(";")[0] || "";
}

function csrfFrom(body) {
  return body.match(/name="csrfToken" value="([^"]+)"/)?.[1] || "";
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  });
}

async function login(email, password = "correct-password") {
  const loginPage = await request("/login");
  const loginBody = await loginPage.text();
  const initialSetCookie = loginPage.headers.get("set-cookie") || "";
  const initialCookie = cookieFrom(loginPage);
  const csrfToken = csrfFrom(loginBody);
  const response = await request("/login", {
    body: new URLSearchParams({ csrfToken, email, password }),
    headers: {
      cookie: initialCookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  return {
    cookie: cookieFrom(response),
    initialCsrfToken: csrfToken,
    initialCookie,
    initialSetCookie,
    response,
  };
}

async function signup(fields) {
  const signupPage = await request("/signup");
  const signupBody = await signupPage.text();
  const initialSetCookie = signupPage.headers.get("set-cookie") || "";
  const initialCookie = cookieFrom(signupPage);
  const csrfToken = csrfFrom(signupBody);
  const response = await request("/signup", {
    body: new URLSearchParams({ csrfToken, ...fields }),
    headers: {
      cookie: initialCookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  return {
    cookie: cookieFrom(response),
    initialCookie,
    initialSetCookie,
    response,
  };
}

before(async () => {
  const app = createApp({
    account: {
      cancelMemberBooking,
      createMemberReview,
      deleteMemberReview,
      createFilm,
      createScreening,
      findBookingById,
      findBookingStatusHistoryByBookingId,
      findBookingsByUserId,
      findStaffContactMessages,
      findStaffOperationalBookings,
      findStaffReviewModerationQueue,
      findOwnerFilmById,
      findOwnerFilms,
      findOwnerScreeningById,
      findOwnerScreeningFilmOptions,
      findOwnerScreenings,
      findOwnerUsers,
      findReviewById,
      findReviewableFilmsByUserId,
      findReviewsByUserId,
      setFilmArchived,
      setReviewVisibility,
      setScreeningStatus,
      transitionStaffBookingStatus,
      updateContactMessageStatus,
      updateFilm,
      updateMemberReview,
      updateOwnerUserAccess,
      updateScreening,
    },
    auth: {
      createMemberUser,
      findUserByEmail,
      hashPassword: async (password, rounds) => `hashed:${rounds}:${password}`,
      verifyPassword: async (password, hash) => password === "correct-password" && hash === "valid-password",
    },
    session: {
      sessionSecret: "test-session-secret",
    },
    users: {
      findActiveUserById,
    },
  });

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("protected routes redirect unauthenticated direct access", async () => {
  for (const route of ["/account", "/account/bookings/1", "/account/reviews/new", "/account/reviews/1", "/account/reviews/1/edit", "/staff", "/admin", "/admin/users", "/admin/films", "/admin/films/new", "/admin/films/1/edit", "/admin/screenings", "/admin/screenings/new", "/admin/screenings/1/edit"]) {
    const response = await request(route);

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/login");
  }
});

test("signup page is public and redirects authenticated users to their account destination", async () => {
  const publicPage = await request("/signup");
  assert.equal(publicPage.status, 200);

  const { cookie } = await login("member@cinema.test");
  const authenticatedPage = await request("/signup", { headers: { cookie } });

  assert.equal(authenticatedPage.status, 303);
  assert.equal(authenticatedPage.headers.get("location"), "/account");
});

test("login uses one generic message for unknown email and wrong password", async () => {
  for (const credentials of [
    ["unknown@cinema.test", "correct-password"],
    ["member@cinema.test", "wrong-password"],
  ]) {
    const result = await login(...credentials);
    const body = await result.response.text();

    assert.equal(result.response.status, 401);
    assert.match(body, /Email or password is incorrect/);
  }
});

test("login session uses the configured cookie and regenerates its identifier", async () => {
  const { cookie, initialCookie, initialSetCookie } = await login("member@cinema.test");

  assert.match(initialCookie, /^cinema_session=/);
  assert.match(initialSetCookie, /HttpOnly/);
  assert.match(initialSetCookie, /SameSite=Lax/);
  assert.match(cookie, /^cinema_session=/);
  assert.notEqual(cookie, initialCookie);
});

test("pre-auth CSRF token is rejected after login session regeneration", async () => {
  const { cookie, initialCsrfToken } = await login("member@cinema.test");

  const staleLogout = await request("/logout", {
    body: new URLSearchParams({ csrfToken: initialCsrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(staleLogout.status, 403);

  const accountPage = await request("/account", { headers: { cookie } });
  const accountBody = await accountPage.text();
  const currentCsrfToken = csrfFrom(accountBody);

  assert.equal(accountPage.status, 200);
  assert.ok(currentCsrfToken);
  assert.notEqual(currentCsrfToken, initialCsrfToken);
});

test("signup validates required fields and preserves non-secret values", async () => {
  const { response } = await signup({
    confirmPassword: "different-password",
    email: "BadEmail",
    firstName: "  Sora  ",
    lastName: "",
    password: "short",
  });
  const body = await response.text();

  assert.equal(response.status, 422);
  assert.match(body, /Please correct the following/);
  assert.match(body, /Email must be a valid email address/);
  assert.match(body, /Last name is required/);
  assert.match(body, /Password must be at least 8 characters/);
  assert.match(body, /Password confirmation must match Password/);
  assert.match(body, /value="bademail"/);
  assert.match(body, /value="Sora"/);
  assert.doesNotMatch(body, /short/);
});

test("signup creates a Member account with a normalized email and hashed password", async () => {
  const { cookie, initialCookie, initialSetCookie, response } = await signup({
    confirmPassword: "P@ssword123",
    email: "NEWMEMBER@Cinema.Test ",
    firstName: " New ",
    lastName: " Member ",
    password: "P@ssword123",
  });

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/account");
  assert.match(initialCookie, /^cinema_session=/);
  assert.match(initialSetCookie, /HttpOnly/);
  assert.match(cookie, /^cinema_session=/);
  assert.notEqual(cookie, initialCookie);

  const createdUser = findUserByEmail("newmember@cinema.test");
  assert.equal(createdUser.role, "member");
  assert.equal(createdUser.password_hash, "hashed:12:P@ssword123");
  assert.equal(createdUser.first_name, "New");
  assert.equal(createdUser.last_name, "Member");

  const accountResponse = await request("/account", { headers: { cookie } });
  const accountBody = await accountResponse.text();
  assert.equal(accountResponse.status, 200);
  assert.match(accountBody, /Welcome, New/);
  assert.match(accountBody, /Your booking history is empty/);
});

test("signup returns a conflict for duplicate emails", async () => {
  const { response } = await signup({
    confirmPassword: "P@ssword123",
    email: "MEMBER@cinema.test",
    firstName: "Sora",
    lastName: "Kim",
    password: "P@ssword123",
  });
  const body = await response.text();

  assert.equal(response.status, 409);
  assert.match(body, /An account with that email already exists/);
});

test("role guards enforce Member, Staff, and Owner direct URL access", async () => {
  const cases = [
    ["member@cinema.test", "/account", 200],
    ["member@cinema.test", "/account/bookings/1", 200],
    ["member@cinema.test", "/account/reviews/1", 200],
    ["member@cinema.test", "/staff", 403],
    ["member@cinema.test", "/admin", 403],
    ["member@cinema.test", "/admin/users", 403],
    ["member@cinema.test", "/admin/films", 403],
    ["member@cinema.test", "/admin/films/new", 403],
    ["member@cinema.test", "/admin/films/1/edit", 403],
    ["member@cinema.test", "/admin/screenings", 403],
    ["member@cinema.test", "/admin/screenings/new", 403],
    ["member@cinema.test", "/admin/screenings/1/edit", 403],
    ["staff@cinema.test", "/account", 403],
    ["staff@cinema.test", "/account/bookings/1", 403],
    ["staff@cinema.test", "/staff", 200],
    ["staff@cinema.test", "/admin", 403],
    ["staff@cinema.test", "/admin/users", 403],
    ["staff@cinema.test", "/admin/films", 403],
    ["staff@cinema.test", "/admin/films/new", 403],
    ["staff@cinema.test", "/admin/films/1/edit", 403],
    ["staff@cinema.test", "/admin/screenings", 403],
    ["staff@cinema.test", "/admin/screenings/new", 403],
    ["staff@cinema.test", "/admin/screenings/1/edit", 403],
    ["owner@cinema.test", "/account", 403],
    ["owner@cinema.test", "/account/reviews/1", 403],
    ["owner@cinema.test", "/staff", 200],
    ["owner@cinema.test", "/admin", 200],
    ["owner@cinema.test", "/admin/users", 200],
    ["owner@cinema.test", "/admin/films", 200],
    ["owner@cinema.test", "/admin/films/new", 200],
    ["owner@cinema.test", "/admin/films/1/edit", 200],
    ["owner@cinema.test", "/admin/screenings", 200],
    ["owner@cinema.test", "/admin/screenings/new", 200],
    ["owner@cinema.test", "/admin/screenings/1/edit", 200],
  ];

  for (const [email, route, expectedStatus] of cases) {
    const { cookie, response: loginResponse } = await login(email);
    const response = await request(route, { headers: { cookie } });

    assert.equal(loginResponse.status, 303);
    assert.equal(response.status, expectedStatus, `${email} ${route}`);
  }
});

test("owner user management changes roles and activation without stale session access", async () => {
  const member = findUserByEmail("member@cinema.test");
  const staff = findUserByEmail("staff@cinema.test");
  const owner = findUserByEmail("owner@cinema.test");
  const memberLogin = await login(member.email);
  const staffLogin = await login(staff.email);

  const staffPost = await request(`/admin/users/${member.user_id}/access`, {
    body: new URLSearchParams({ csrfToken: "invalid", isActive: "true", role: "staff" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(staffPost.status, 403);

  const ownerLogin = await login(owner.email);
  const usersPage = await request("/admin/users", { headers: { cookie: ownerLogin.cookie } });
  const usersBody = await usersPage.text();
  const csrfToken = csrfFrom(usersBody);
  assert.equal(usersPage.status, 200);
  assert.match(usersBody, /Manage user access/);
  assert.match(usersBody, /Sora Kim/);
  assert.match(usersBody, /Joon Lee/);
  assert.match(usersBody, /Current Owner account cannot change itself/);
  assert.ok(csrfToken);

  const invalidCsrf = await request(`/admin/users/${staff.user_id}/access`, {
    body: new URLSearchParams({ csrfToken: "invalid", isActive: "true", role: "member" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidCsrf.status, 403);

  const invalidRole = await request(`/admin/users/${staff.user_id}/access`, {
    body: new URLSearchParams({ csrfToken, isActive: "true", role: "admin" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidRole.status, 404);

  const missingUser = await request("/admin/users/999/access", {
    body: new URLSearchParams({ csrfToken, isActive: "true", role: "staff" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(missingUser.status, 404);

  const selfChange = await request(`/admin/users/${owner.user_id}/access`, {
    body: new URLSearchParams({ csrfToken, isActive: "false", role: "member" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(selfChange.status, 409);
  assert.equal(owner.role, "owner");
  assert.equal(owner.is_active, true);

  const demoteStaff = await request(`/admin/users/${staff.user_id}/access`, {
    body: new URLSearchParams({ csrfToken, isActive: "true", role: "member" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(demoteStaff.status, 303);
  assert.equal(demoteStaff.headers.get("location"), "/admin/users");
  assert.equal(staff.role, "member");

  const staleStaffAccess = await request("/staff", { headers: { cookie: staffLogin.cookie } });
  assert.equal(staleStaffAccess.status, 403);

  const deactivateMember = await request(`/admin/users/${member.user_id}/access`, {
    body: new URLSearchParams({ csrfToken, isActive: "false", role: "member" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(deactivateMember.status, 303);
  assert.equal(member.is_active, false);

  const staleMemberAccess = await request("/account", { headers: { cookie: memberLogin.cookie } });
  assert.equal(staleMemberAccess.status, 303);
  assert.equal(staleMemberAccess.headers.get("location"), "/login");

  staff.role = "staff";
  staff.is_active = true;
  member.role = "member";
  member.is_active = true;
});

test("staff dashboard updates booking status with CSRF and appends history", async () => {
  const staffBooking = {
    booked_at: "2026-07-01T18:30:00.000Z",
    booking_id: 60,
    cancelled_at: null,
    film_title: "House of Hummingbird",
    program_label: "Director Q&A",
    screening_id: 60,
    screening_status: "scheduled",
    starts_at: "2099-07-20T01:00:00.000Z",
    status: "confirmed",
    user_id: 1,
  };
  bookings.push(staffBooking);

  const memberLogin = await login("member@cinema.test");
  const memberPost = await request("/staff/bookings/60/status", {
    body: new URLSearchParams({ csrfToken: "invalid", toStatus: "checked_in" }),
    headers: {
      cookie: memberLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(memberPost.status, 403);

  const staffLogin = await login("staff@cinema.test");
  const dashboard = await request("/staff", { headers: { cookie: staffLogin.cookie } });
  const dashboardBody = await dashboard.text();
  const csrfToken = csrfFrom(dashboardBody);
  assert.equal(dashboard.status, 200);
  assert.match(dashboardBody, /Operational bookings/);
  assert.match(dashboardBody, /Operational booking roster grouped by screening/);
  assert.match(dashboardBody, /Director Q&amp;A/);
  assert.match(dashboardBody, /1 booking needs staff action/);
  assert.match(dashboardBody, /1 booking/);
  assert.match(dashboardBody, /Check In/);
  assert.match(dashboardBody, /Mark No Show/);
  assert.match(dashboardBody, /Sora Kim/);
  assert.ok(csrfToken);

  const invalidCsrf = await request("/staff/bookings/60/status", {
    body: new URLSearchParams({ csrfToken: "invalid", toStatus: "checked_in" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidCsrf.status, 403);

  const invalidTransition = await request("/staff/bookings/60/status", {
    body: new URLSearchParams({ csrfToken, toStatus: "completed" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidTransition.status, 409);
  assert.equal(staffBooking.status, "confirmed");

  const missingBooking = await request("/staff/bookings/999/status", {
    body: new URLSearchParams({ csrfToken, toStatus: "checked_in" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(missingBooking.status, 404);

  const checkIn = await request("/staff/bookings/60/status", {
    body: new URLSearchParams({ csrfToken, toStatus: "checked_in" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(checkIn.status, 303);
  assert.equal(checkIn.headers.get("location"), "/staff");
  assert.equal(staffBooking.status, "checked_in");
  assert.ok(bookingStatusHistory.some((entry) => (
    entry.booking_id === 60
    && entry.from_status === "confirmed"
    && entry.to_status === "checked_in"
    && entry.changed_by_user_id === 2
  )));

  const ownerLogin = await login("owner@cinema.test");
  const ownerDashboard = await request("/staff", { headers: { cookie: ownerLogin.cookie } });
  const ownerCsrfToken = csrfFrom(await ownerDashboard.text());
  const complete = await request("/staff/bookings/60/status", {
    body: new URLSearchParams({ csrfToken: ownerCsrfToken, toStatus: "completed" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(complete.status, 303);
  assert.equal(staffBooking.status, "completed");
  assert.ok(bookingStatusHistory.some((entry) => (
    entry.booking_id === 60
    && entry.from_status === "checked_in"
    && entry.to_status === "completed"
    && entry.changed_by_user_id === 3
  )));

  const bookingIndex = bookings.findIndex((booking) => booking.booking_id === 60);
  if (bookingIndex >= 0) {
    bookings.splice(bookingIndex, 1);
  }
  for (let index = bookingStatusHistory.length - 1; index >= 0; index -= 1) {
    if (bookingStatusHistory[index].booking_id === 60) {
      bookingStatusHistory.splice(index, 1);
    }
  }
});

test("staff dashboard moderates reviews and processes contact messages", async () => {
  const memberLogin = await login("member@cinema.test");
  const memberReviewPost = await request("/staff/reviews/1/visibility", {
    body: new URLSearchParams({ csrfToken: "invalid", isVisible: "false" }),
    headers: {
      cookie: memberLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(memberReviewPost.status, 403);

  const staffLogin = await login("staff@cinema.test");
  const dashboard = await request("/staff", { headers: { cookie: staffLogin.cookie } });
  const dashboardBody = await dashboard.text();
  const csrfToken = csrfFrom(dashboardBody);
  assert.equal(dashboard.status, 200);
  assert.match(dashboardBody, /Staff operations overview/);
  assert.match(dashboardBody, /Booking actions/);
  assert.match(dashboardBody, /1 action/);
  assert.match(dashboardBody, /Review queue/);
  assert.match(dashboardBody, /2 reviews/);
  assert.match(dashboardBody, /Member reviews/);
  assert.match(dashboardBody, /Review moderation queue/);
  assert.match(dashboardBody, /A precise and quietly moving film/);
  assert.match(dashboardBody, /Message queue/);
  assert.match(dashboardBody, /2 messages/);
  assert.match(dashboardBody, /Group screening question/);
  assert.match(dashboardBody, /Accessibility information/);
  assert.ok(csrfToken);

  const invalidReviewCsrf = await request("/staff/reviews/1/visibility", {
    body: new URLSearchParams({ csrfToken: "invalid", isVisible: "false" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidReviewCsrf.status, 403);

  const invalidReviewAction = await request("/staff/reviews/1/visibility", {
    body: new URLSearchParams({ csrfToken, isVisible: "maybe" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidReviewAction.status, 404);

  const hideReview = await request("/staff/reviews/1/visibility", {
    body: new URLSearchParams({ csrfToken, isVisible: "false", moderationNote: "Contains a spoiler." }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(hideReview.status, 303);
  assert.equal(hideReview.headers.get("location"), "/staff");
  assert.equal(reviews[0].is_visible, false);
  assert.equal(reviews[0].moderated_by_user_id, 2);
  assert.equal(reviews[0].moderation_note, "Contains a spoiler.");

  const missingReview = await request("/staff/reviews/999/visibility", {
    body: new URLSearchParams({ csrfToken, isVisible: "true" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(missingReview.status, 404);

  const memberMessagePost = await request("/staff/messages/1/status", {
    body: new URLSearchParams({ csrfToken: "invalid", status: "in_progress" }),
    headers: {
      cookie: memberLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(memberMessagePost.status, 403);

  const invalidMessageStatus = await request("/staff/messages/1/status", {
    body: new URLSearchParams({ csrfToken, status: "waiting" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidMessageStatus.status, 404);

  const startMessage = await request("/staff/messages/1/status", {
    body: new URLSearchParams({ csrfToken, status: "in_progress", staffNote: "Checking group availability." }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(startMessage.status, 303);
  assert.equal(startMessage.headers.get("location"), "/staff");
  assert.equal(contactMessages[0].status, "in_progress");
  assert.equal(contactMessages[0].assigned_to_user_id, 2);
  assert.equal(contactMessages[0].staff_note, "Checking group availability.");

  const ownerLogin = await login("owner@cinema.test");
  const ownerDashboard = await request("/staff", { headers: { cookie: ownerLogin.cookie } });
  const ownerCsrfToken = csrfFrom(await ownerDashboard.text());
  const restoreReview = await request("/staff/reviews/1/visibility", {
    body: new URLSearchParams({ csrfToken: ownerCsrfToken, isVisible: "true", moderationNote: "Spoiler removed." }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(restoreReview.status, 303);
  assert.equal(reviews[0].is_visible, true);
  assert.equal(reviews[0].moderated_by_user_id, 3);
  assert.equal(reviews[0].moderation_note, "Spoiler removed.");

  const closeMessage = await request("/staff/messages/1/status", {
    body: new URLSearchParams({ csrfToken: ownerCsrfToken, status: "closed", staffNote: "Reply sent." }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(closeMessage.status, 303);
  assert.equal(contactMessages[0].status, "closed");
  assert.equal(contactMessages[0].assigned_to_user_id, 3);
  assert.equal(contactMessages[0].staff_note, "Reply sent.");

  reviews[0].is_visible = true;
  reviews[0].moderated_by_user_id = null;
  reviews[0].moderation_note = null;
  contactMessages[0].status = "new";
  contactMessages[0].assigned_to_user_id = null;
  contactMessages[0].staff_note = null;
});

test("owner film create and edit forms validate input and preserve public catalog data", async () => {
  const memberLogin = await login("member@cinema.test");
  const memberCreate = await request("/admin/films", {
    body: new URLSearchParams({ csrfToken: "invalid", title: "Unauthorized" }),
    headers: {
      cookie: memberLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(memberCreate.status, 403);

  const ownerLogin = await login("owner@cinema.test");
  const newFilmPage = await request("/admin/films/new", { headers: { cookie: ownerLogin.cookie } });
  const newFilmBody = await newFilmPage.text();
  const csrfToken = csrfFrom(newFilmBody);

  assert.equal(newFilmPage.status, 200);
  assert.match(newFilmBody, /Add a film to the catalog/);
  assert.match(newFilmBody, /name="csrfToken"/);
  assert.ok(csrfToken);

  const invalidResponse = await request("/admin/films", {
    body: new URLSearchParams({ csrfToken, title: "Only Title" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const invalidBody = await invalidResponse.text();
  assert.equal(invalidResponse.status, 422);
  assert.match(invalidBody, /Please correct the following/);
  assert.match(invalidBody, /Slug is required/);

  const duplicateResponse = await request("/admin/films", {
    body: new URLSearchParams({
      ageRating: "12+",
      country: "South Korea",
      csrfToken,
      director: "Kim Bora",
      genre: "Drama",
      posterUrl: "/images/films/test.jpg",
      releaseYear: "2024",
      runtimeMinutes: "95",
      slug: "house-of-hummingbird",
      synopsis: "A valid synopsis for a duplicate slug check.",
      title: "Duplicate Slug Film",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(duplicateResponse.status, 409);

  const createResponse = await request("/admin/films", {
    body: new URLSearchParams({
      ageRating: "12+",
      country: "South Korea",
      csrfToken,
      director: "Park Chan-ok",
      genre: "Drama",
      isFeatured: "true",
      posterUrl: "/images/films/test-film.jpg",
      releaseYear: "2024",
      runtimeMinutes: "97",
      slug: "test-film",
      synopsis: "A focused film record created through the Owner form.",
      title: "Test Film",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(createResponse.status, 303);
  assert.equal(createResponse.headers.get("location"), "/admin/films");
  const createdFilm = films.find((film) => film.slug === "test-film");
  assert.ok(createdFilm);
  assert.equal(createdFilm.is_featured, true);
  assert.equal(createdFilm.is_archived, false);

  const editPage = await request(`/admin/films/${createdFilm.film_id}/edit`, { headers: { cookie: ownerLogin.cookie } });
  const editBody = await editPage.text();
  assert.equal(editPage.status, 200);
  assert.match(editBody, /Edit a film record/);
  assert.match(editBody, /value="Test Film"/);

  const editCsrfToken = csrfFrom(editBody);
  const editResponse = await request(`/admin/films/${createdFilm.film_id}`, {
    body: new URLSearchParams({
      ageRating: "15+",
      country: "South Korea",
      csrfToken: editCsrfToken,
      director: "Park Chan-ok",
      genre: "Drama",
      isArchived: "true",
      posterUrl: "/images/films/test-film.jpg",
      releaseYear: "2024",
      runtimeMinutes: "101",
      slug: "test-film-updated",
      synopsis: "Updated text from the Owner edit form.",
      title: "Test Film Updated",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(editResponse.status, 303);
  assert.equal(createdFilm.title, "Test Film Updated");
  assert.equal(createdFilm.slug, "test-film-updated");
  assert.equal(createdFilm.is_archived, true);

  const missingEdit = await request("/admin/films/999/edit", { headers: { cookie: ownerLogin.cookie } });
  assert.equal(missingEdit.status, 404);
});

test("owner screening create and edit forms validate input and preserve schedule rules", async () => {
  const memberLogin = await login("member@cinema.test");
  const memberCreate = await request("/admin/screenings", {
    body: new URLSearchParams({ csrfToken: "invalid", filmId: "1" }),
    headers: {
      cookie: memberLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(memberCreate.status, 403);

  const ownerLogin = await login("owner@cinema.test");
  const newScreeningPage = await request("/admin/screenings/new", { headers: { cookie: ownerLogin.cookie } });
  const newScreeningBody = await newScreeningPage.text();
  const csrfToken = csrfFrom(newScreeningBody);

  assert.equal(newScreeningPage.status, 200);
  assert.match(newScreeningBody, /Add a screening to the schedule/);
  assert.match(newScreeningBody, /House of Hummingbird/);
  assert.doesNotMatch(newScreeningBody, /Little Forest/);
  assert.ok(csrfToken);

  const invalidResponse = await request("/admin/screenings", {
    body: new URLSearchParams({ csrfToken, filmId: "1" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const invalidBody = await invalidResponse.text();
  assert.equal(invalidResponse.status, 422);
  assert.match(invalidBody, /Please correct the following/);
  assert.match(invalidBody, /Start time is required/);

  const duplicateResponse = await request("/admin/screenings", {
    body: new URLSearchParams({
      capacity: "60",
      csrfToken,
      filmId: "1",
      hasGuestTalk: "true",
      programLabel: "Duplicate Check",
      startsAt: "2026-06-20T01:00:00.000Z",
      status: "scheduled",
      ticketPriceCents: "1200",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(duplicateResponse.status, 409);

  const createResponse = await request("/admin/screenings", {
    body: new URLSearchParams({
      capacity: "48",
      csrfToken,
      filmId: "1",
      programLabel: "Route Test",
      startsAt: "2026-07-20T19:00",
      status: "scheduled",
      ticketPriceCents: "1100",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(createResponse.status, 303);
  const createdScreening = screenings.find((screening) => screening.program_label === "Route Test");
  assert.ok(createdScreening);
  assert.equal(createdScreening.capacity, 48);
  assert.equal(createdScreening.status, "scheduled");

  const editPage = await request(`/admin/screenings/${createdScreening.screening_id}/edit`, { headers: { cookie: ownerLogin.cookie } });
  const editBody = await editPage.text();
  const editCsrfToken = csrfFrom(editBody);
  assert.equal(editPage.status, 200);
  assert.match(editBody, /Edit a screening record/);
  assert.match(editBody, /Route Test/);

  const editResponse = await request(`/admin/screenings/${createdScreening.screening_id}`, {
    body: new URLSearchParams({
      capacity: "52",
      csrfToken: editCsrfToken,
      filmId: "1",
      hasGuestTalk: "true",
      programLabel: "Route Test Updated",
      startsAt: "2026-07-21T19:30",
      status: "cancelled",
      ticketPriceCents: "1300",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(editResponse.status, 303);
  assert.equal(createdScreening.capacity, 52);
  assert.equal(createdScreening.status, "cancelled");
  assert.equal(createdScreening.program_label, "Route Test Updated");

  const activeCapacityConflict = await request("/admin/screenings/1", {
    body: new URLSearchParams({
      capacity: "0",
      csrfToken: editCsrfToken,
      filmId: "1",
      programLabel: "Too Small",
      startsAt: "2026-07-22T19:30",
      status: "scheduled",
      ticketPriceCents: "1300",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(activeCapacityConflict.status, 422);

  const activeCapacityRuleConflict = await request("/admin/screenings/1", {
    body: new URLSearchParams({
      capacity: "1",
      csrfToken: editCsrfToken,
      filmId: "1",
      programLabel: "Too Small",
      startsAt: "2026-07-22T19:30",
      status: "scheduled",
      ticketPriceCents: "1300",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(activeCapacityRuleConflict.status, 409);

  const activeCancelConflict = await request("/admin/screenings/1", {
    body: new URLSearchParams({
      capacity: "60",
      csrfToken: editCsrfToken,
      filmId: "1",
      programLabel: "Conflict",
      startsAt: "2026-07-22T19:30",
      status: "cancelled",
      ticketPriceCents: "1300",
    }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(activeCancelConflict.status, 409);

  const completedEdit = await request("/admin/screenings/3/edit", { headers: { cookie: ownerLogin.cookie } });
  assert.equal(completedEdit.status, 404);
});

test("owner screening status actions are owner-only and protect active bookings", async () => {
  const memberLogin = await login("member@cinema.test");
  const memberCancel = await request("/admin/screenings/2/status", {
    body: new URLSearchParams({ csrfToken: "invalid", status: "cancelled" }),
    headers: {
      cookie: memberLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(memberCancel.status, 403);

  const ownerLogin = await login("owner@cinema.test");
  const screeningsPage = await request("/admin/screenings", { headers: { cookie: ownerLogin.cookie } });
  const screeningsBody = await screeningsPage.text();
  const csrfToken = csrfFrom(screeningsBody);

  assert.equal(screeningsPage.status, 200);
  assert.match(screeningsBody, /Manage the public screening schedule/);
  assert.match(screeningsBody, /House of Hummingbird/);
  assert.match(screeningsBody, /Little Forest/);
  assert.match(screeningsBody, /Microhabitat/);
  assert.match(screeningsBody, /Cancel Screening/);
  assert.match(screeningsBody, /No management action/);
  assert.match(screeningsBody, /disabled/);
  assert.ok(csrfToken);

  const conflictResponse = await request("/admin/screenings/1/status", {
    body: new URLSearchParams({ csrfToken, status: "cancelled" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(conflictResponse.status, 409);
  assert.equal(screenings[0].status, "scheduled");

  const cancelResponse = await request("/admin/screenings/2/status", {
    body: new URLSearchParams({ csrfToken, status: "cancelled" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(cancelResponse.status, 303);
  assert.equal(cancelResponse.headers.get("location"), "/admin/screenings");
  assert.equal(screenings[1].status, "cancelled");

  const invalidResponse = await request("/admin/screenings/not-a-number/status", {
    body: new URLSearchParams({ csrfToken, status: "cancelled" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(invalidResponse.status, 404);

  const completedResponse = await request("/admin/screenings/3/status", {
    body: new URLSearchParams({ csrfToken, status: "cancelled" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(completedResponse.status, 404);
  assert.equal(screenings[2].status, "completed");

  const restoreResponse = await request("/admin/screenings/2/status", {
    body: new URLSearchParams({ csrfToken, status: "scheduled" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(restoreResponse.status, 303);
  assert.equal(screenings[1].status, "scheduled");
});

test("owner film catalog archive actions are owner-only and preserve history", async () => {
  const memberLogin = await login("member@cinema.test");
  const memberArchive = await request("/admin/films/1/archive", {
    body: new URLSearchParams({ csrfToken: "invalid", isArchived: "true" }),
    headers: {
      cookie: memberLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(memberArchive.status, 403);

  const ownerLogin = await login("owner@cinema.test");
  const filmsPage = await request("/admin/films", { headers: { cookie: ownerLogin.cookie } });
  const filmsBody = await filmsPage.text();
  const csrfToken = csrfFrom(filmsBody);

  assert.equal(filmsPage.status, 200);
  assert.match(filmsBody, /Manage the public film catalog/);
  assert.match(filmsBody, /House of Hummingbird/);
  assert.match(filmsBody, /Archive Film/);
  assert.ok(csrfToken);

  const archiveResponse = await request("/admin/films/1/archive", {
    body: new URLSearchParams({ csrfToken, isArchived: "true" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(archiveResponse.status, 303);
  assert.equal(archiveResponse.headers.get("location"), "/admin/films");
  assert.equal(films[0].is_archived, true);

  const invalidResponse = await request("/admin/films/not-a-number/archive", {
    body: new URLSearchParams({ csrfToken, isArchived: "true" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(invalidResponse.status, 404);

  const restoreResponse = await request("/admin/films/1/archive", {
    body: new URLSearchParams({ csrfToken, isArchived: "false" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  assert.equal(restoreResponse.status, 303);
  assert.equal(films[0].is_archived, false);
});

test("current user is reloaded and inactive sessions lose access", async () => {
  const member = findUserByEmail("member@cinema.test");
  const { cookie } = await login(member.email);

  member.is_active = false;
  const response = await request("/account", { headers: { cookie } });
  member.is_active = true;

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/login");
});

test("current role is reloaded so stale privileges are rejected", async () => {
  const staff = findUserByEmail("staff@cinema.test");
  const { cookie } = await login(staff.email);

  staff.role = "member";
  const response = await request("/staff", { headers: { cookie } });
  staff.role = "staff";

  assert.equal(response.status, 403);
});

test("member account lists only the signed-in member bookings", async () => {
  const { cookie } = await login("member@cinema.test");
  const response = await request("/account", { headers: { cookie } });
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /Booking history/);
  assert.match(body, /House of Hummingbird/);
  assert.match(body, /Microhabitat/);
  assert.match(body, /Confirmed/);
  assert.match(body, /Completed/);
  assert.match(body, /href="\/account\/bookings\/1"/);
  assert.match(body, /href="\/account\/bookings\/2"/);
  assert.doesNotMatch(body, /Little Forest/);
  assert.doesNotMatch(body, /href="\/account\/bookings\/3"/);
});

test("member cancellation is owner-only, CSRF-protected, and limited to confirmed upcoming bookings", async () => {
  const otherMember = await createMemberUser({
    email: "cancel-other@cinema.test",
    firstName: "Cancel",
    lastName: "Other",
    passwordHash: "valid-password",
  });
  const cancellableBooking = {
    booked_at: "2026-06-30T18:30:00.000Z",
    booking_id: 50,
    cancelled_at: null,
    film_title: "House of Hummingbird",
    screening_id: 50,
    starts_at: "2099-07-15T01:00:00.000Z",
    status: "confirmed",
    user_id: 1,
  };
  const completedBooking = {
    booked_at: "2026-06-30T18:30:00.000Z",
    booking_id: 51,
    cancelled_at: null,
    film_title: "Microhabitat",
    screening_id: 51,
    starts_at: "2099-07-16T01:00:00.000Z",
    status: "completed",
    user_id: 1,
  };
  const otherBooking = {
    booked_at: "2026-06-30T18:30:00.000Z",
    booking_id: 52,
    cancelled_at: null,
    film_title: "Little Forest",
    screening_id: 52,
    starts_at: "2099-07-17T01:00:00.000Z",
    status: "confirmed",
    user_id: otherMember.user_id,
  };
  bookings.push(cancellableBooking, completedBooking, otherBooking);

  const unauthenticatedPost = await request("/account/bookings/50/cancel", {
    method: "POST",
  });
  assert.equal(unauthenticatedPost.status, 303);
  assert.equal(unauthenticatedPost.headers.get("location"), "/login");

  const staffLogin = await login("staff@cinema.test");
  const staffPost = await request("/account/bookings/50/cancel", {
    body: new URLSearchParams({ csrfToken: "invalid" }),
    headers: {
      cookie: staffLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(staffPost.status, 403);

  const ownerLogin = await login("owner@cinema.test");
  const ownerPost = await request("/account/bookings/50/cancel", {
    body: new URLSearchParams({ csrfToken: "invalid" }),
    headers: {
      cookie: ownerLogin.cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(ownerPost.status, 403);

  const { cookie } = await login("member@cinema.test");
  const detailPage = await request("/account/bookings/50", { headers: { cookie } });
  const detailBody = await detailPage.text();
  const csrfToken = csrfFrom(detailBody);
  assert.equal(detailPage.status, 200);
  assert.match(detailBody, /Cancel Booking/);
  assert.match(detailBody, /No status history is recorded for this booking yet/);
  assert.ok(csrfToken);

  const invalidCsrfPost = await request("/account/bookings/50/cancel", {
    body: new URLSearchParams({ csrfToken: "invalid" }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidCsrfPost.status, 403);

  const missingPost = await request("/account/bookings/999/cancel", {
    body: new URLSearchParams({ csrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(missingPost.status, 404);

  const wrongOwnerPost = await request("/account/bookings/52/cancel", {
    body: new URLSearchParams({ csrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(wrongOwnerPost.status, 404);

  const completedPost = await request("/account/bookings/51/cancel", {
    body: new URLSearchParams({ csrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(completedPost.status, 409);
  assert.equal(completedBooking.status, "completed");

  const cancelPost = await request("/account/bookings/50/cancel", {
    body: new URLSearchParams({ csrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(cancelPost.status, 303);
  assert.equal(cancelPost.headers.get("location"), "/account/bookings/50");
  assert.equal(cancellableBooking.status, "cancelled");
  assert.ok(cancellableBooking.cancelled_at);

  const cancelledDetail = await request("/account/bookings/50", { headers: { cookie } });
  const cancelledBody = await cancelledDetail.text();
  assert.equal(cancelledDetail.status, 200);
  assert.match(cancelledBody, /This booking has already been cancelled/);
  assert.match(cancelledBody, /Booking timeline/);
  assert.match(cancelledBody, /Confirmed/);
  assert.match(cancelledBody, /Cancelled/);
  assert.match(cancelledBody, /Booking cancelled by member/);

  const duplicateCancel = await request("/account/bookings/50/cancel", {
    body: new URLSearchParams({ csrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(duplicateCancel.status, 409);
});

test("member-owned booking and review routes reject invalid, missing, and cross-account access", async () => {
  const otherMember = await createMemberUser({
    email: "othermember@cinema.test",
    firstName: "Other",
    lastName: "Member",
    passwordHash: "valid-password",
  });
  bookings.push({
    booked_at: "2026-06-11T18:30:00.000Z",
    booking_id: 4,
    cancelled_at: null,
    film_title: "Little Forest",
    screening_id: 13,
    starts_at: "2026-06-17T01:00:00.000Z",
    status: "confirmed",
    user_id: otherMember.user_id,
  });
  reviews.push({
    body: "Other member private review.",
    created_at: "2026-06-12T18:30:00.000Z",
    film_title: "House of Hummingbird",
    is_visible: true,
    rating: 4,
    review_id: 3,
    updated_at: "2026-06-12T18:30:00.000Z",
    user_id: otherMember.user_id,
  });

  const { cookie } = await login("member@cinema.test");
  const cases = [
    ["/account/bookings/not-a-number", 404],
    ["/account/bookings/999", 404],
    ["/account/bookings/4", 404],
    ["/account/reviews/not-a-number", 404],
    ["/account/reviews/999", 404],
    ["/account/reviews/3", 404],
  ];

  for (const [route, expectedStatus] of cases) {
    const response = await request(route, { headers: { cookie } });
    assert.equal(response.status, expectedStatus, route);
  }
});

test("owned booking and review pages render resource details for the signed-in member", async () => {
  const { cookie } = await login("member@cinema.test");

  const bookingResponse = await request("/account/bookings/1", { headers: { cookie } });
  const bookingBody = await bookingResponse.text();
  assert.equal(bookingResponse.status, 200);
  assert.match(bookingBody, /House of Hummingbird/);
  assert.match(bookingBody, /Booking ID/);
  assert.match(bookingBody, /Booking timeline/);
  assert.match(bookingBody, /Created/);
  assert.match(bookingBody, /Sora Kim \(Member\)/);
  assert.match(bookingBody, /Booking created/);

  const reviewResponse = await request("/account/reviews/1", { headers: { cookie } });
  const reviewBody = await reviewResponse.text();
  assert.equal(reviewResponse.status, 200);
  assert.match(reviewBody, /Microhabitat/);
  assert.match(reviewBody, /A precise and quietly moving film/);
});

test("member review CRUD requires a completed booking and preserves ownership", async () => {
  const reviewableBooking = {
    booked_at: "2026-07-04T18:30:00.000Z",
    booking_id: 70,
    cancelled_at: null,
    film_title: "Little Forest",
    screening_id: 70,
    starts_at: "2026-07-04T20:00:00.000Z",
    status: "completed",
    user_id: 1,
  };
  bookings.push(reviewableBooking);

  const { cookie } = await login("member@cinema.test");
  const account = await request("/account", { headers: { cookie } });
  const accountBody = await account.text();
  assert.equal(account.status, 200);
  assert.match(accountBody, /Film reviews/);
  assert.match(accountBody, /Write a Review/);
  assert.match(accountBody, /Microhabitat/);

  const newForm = await request("/account/reviews/new", { headers: { cookie } });
  const newFormBody = await newForm.text();
  const csrfToken = csrfFrom(newFormBody);
  assert.equal(newForm.status, 200);
  assert.match(newFormBody, /Write a film review/);
  assert.match(newFormBody, /Little Forest/);
  assert.match(newFormBody, /Microhabitat \(already reviewed\)/);
  assert.ok(csrfToken);

  const invalidCsrf = await request("/account/reviews", {
    body: new URLSearchParams({ csrfToken: "invalid", filmId: "2", rating: "5", body: "A warm and quiet film." }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidCsrf.status, 403);

  const invalidInput = await request("/account/reviews", {
    body: new URLSearchParams({ csrfToken, filmId: "", rating: "6", body: "" }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const invalidBody = await invalidInput.text();
  assert.equal(invalidInput.status, 400);
  assert.match(invalidBody, /Please correct the following/);
  assert.match(invalidBody, /Film is required/);
  assert.match(invalidBody, /Rating must be between 1 and 5/);
  assert.match(invalidBody, /Review is required/);

  const ineligible = await request("/account/reviews", {
    body: new URLSearchParams({ csrfToken, filmId: "1", rating: "4", body: "Not eligible yet." }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const ineligibleBody = await ineligible.text();
  assert.equal(ineligible.status, 409);
  assert.match(ineligibleBody, /completed booking is required/i);

  const created = await request("/account/reviews", {
    body: new URLSearchParams({ csrfToken, filmId: "2", rating: "4", body: "A warm and quiet film." }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(created.status, 303);
  const createdLocation = created.headers.get("location");
  assert.match(createdLocation, /^\/account\/reviews\/\d+$/);
  const reviewId = Number(createdLocation.split("/").at(-1));
  assert.ok(reviews.some((review) => review.review_id === reviewId && review.user_id === 1 && review.film_id === 2));

  const duplicate = await request("/account/reviews", {
    body: new URLSearchParams({ csrfToken, filmId: "2", rating: "5", body: "Second attempt." }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(duplicate.status, 409);

  const detail = await request(createdLocation, { headers: { cookie } });
  const detailBody = await detail.text();
  assert.equal(detail.status, 200);
  assert.match(detailBody, /Little Forest/);
  assert.match(detailBody, /A warm and quiet film/);
  assert.match(detailBody, /Edit Review/);
  assert.match(detailBody, /Delete Review/);

  const editForm = await request(`/account/reviews/${reviewId}/edit`, { headers: { cookie } });
  const editFormBody = await editForm.text();
  const editCsrfToken = csrfFrom(editFormBody);
  assert.equal(editForm.status, 200);
  assert.match(editFormBody, /Edit your review/);
  assert.match(editFormBody, /Little Forest/);

  const invalidEdit = await request(`/account/reviews/${reviewId}`, {
    body: new URLSearchParams({ csrfToken: editCsrfToken, rating: "0", body: "" }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidEdit.status, 400);

  const wrongOwnerUpdate = await request("/account/reviews/2", {
    body: new URLSearchParams({ csrfToken: editCsrfToken, rating: "5", body: "Wrong owner edit." }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(wrongOwnerUpdate.status, 404);

  const updated = await request(`/account/reviews/${reviewId}`, {
    body: new URLSearchParams({ csrfToken: editCsrfToken, rating: "5", body: "Updated after thinking about the film." }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(updated.status, 303);
  assert.equal(updated.headers.get("location"), `/account/reviews/${reviewId}`);
  assert.equal(reviews.find((review) => review.review_id === reviewId).rating, 5);

  const deleteResponse = await request(`/account/reviews/${reviewId}/delete`, {
    body: new URLSearchParams({ csrfToken: editCsrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(deleteResponse.status, 303);
  assert.equal(deleteResponse.headers.get("location"), "/account");
  assert.equal(reviews.some((review) => review.review_id === reviewId), false);

  const deletedDetail = await request(`/account/reviews/${reviewId}`, { headers: { cookie } });
  assert.equal(deletedDetail.status, 404);

  const bookingIndex = bookings.findIndex((booking) => booking.booking_id === 70);
  if (bookingIndex >= 0) {
    bookings.splice(bookingIndex, 1);
  }
});

test("logout requires CSRF and invalidates the active session", async () => {
  const { cookie } = await login("member@cinema.test");
  const accountPage = await request("/account", { headers: { cookie } });
  const accountBody = await accountPage.text();
  const csrfToken = csrfFrom(accountBody);

  const invalidCsrf = await request("/logout", {
    body: new URLSearchParams({ csrfToken: "invalid" }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidCsrf.status, 403);

  const logoutResponse = await request("/logout", {
    body: new URLSearchParams({ csrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(logoutResponse.status, 303);

  const afterLogout = await request("/account", { headers: { cookie } });
  assert.equal(afterLogout.status, 303);
  assert.equal(afterLogout.headers.get("location"), "/login");
});
