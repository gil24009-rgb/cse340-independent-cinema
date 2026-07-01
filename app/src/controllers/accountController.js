import {
  createFilm,
  FilmSlugConflictError,
  findOwnerFilmById,
  findOwnerFilms,
  setFilmArchived,
  updateFilm,
} from "../models/filmModel.js";
import {
  BookingCancellationConflictError,
  BookingStatusTransitionConflictError,
  cancelMemberBooking,
  findBookingStatusHistoryByBookingId,
  findBookingsByUserId,
  findStaffOperationalBookings,
  transitionStaffBookingStatus,
} from "../models/bookingModel.js";
import {
  createScreening,
  findOwnerScreeningById,
  findOwnerScreeningFilmOptions,
  findOwnerScreenings,
  ScreeningCapacityConflictError,
  ScreeningScheduleConflictError,
  ScreeningStatusConflictError,
  setScreeningStatus,
  updateScreening,
} from "../models/screeningModel.js";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDateTime(value) {
  return value ? dateTimeFormatter.format(new Date(value)) : "Not available";
}

function formatDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function formatStatus(status) {
  return typeof status === "string"
    ? status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
    : "Unknown";
}

function createNotFoundError(message = "Page not found.") {
  const error = new Error(message);
  error.status = 404;
  return error;
}

function parsePositiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toBoolean(value) {
  return value === "true";
}

function toCheckboxBoolean(value) {
  return value === "true" || value === "on";
}

function isAllowedScreeningStatus(value) {
  return value === "scheduled" || value === "cancelled";
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value) {
  return normalizeText(value).toLowerCase();
}

function parseFormInteger(value) {
  const normalized = normalizeText(value);
  const parsed = Number(normalized);

  return Number.isInteger(parsed) ? parsed : null;
}

function validateLength(errors, field, label, value, maxLength) {
  if (value.length > maxLength) {
    errors[field] ||= [];
    errors[field].push(`${label} must be ${maxLength} characters or fewer.`);
  }
}

function addRequiredError(errors, field, label, value) {
  if (!value) {
    errors[field] ||= [];
    errors[field].push(`${label} is required.`);
  }
}

function ownerFilmFormFromBody(body = {}) {
  return {
    ageRating: normalizeText(body.ageRating),
    country: normalizeText(body.country),
    director: normalizeText(body.director),
    genre: normalizeText(body.genre),
    isArchived: toCheckboxBoolean(body.isArchived),
    isFeatured: toCheckboxBoolean(body.isFeatured),
    posterUrl: normalizeText(body.posterUrl),
    releaseYear: normalizeText(body.releaseYear),
    runtimeMinutes: normalizeText(body.runtimeMinutes),
    slug: normalizeSlug(body.slug),
    synopsis: normalizeText(body.synopsis),
    title: normalizeText(body.title),
  };
}

function ownerFilmFormFromRecord(film = {}) {
  return {
    ageRating: film.age_rating || "",
    country: film.country || "",
    director: film.director || "",
    genre: film.genre || "",
    isArchived: Boolean(film.is_archived),
    isFeatured: Boolean(film.is_featured),
    posterUrl: film.poster_url || "",
    releaseYear: film.release_year ? String(film.release_year) : "",
    runtimeMinutes: film.runtime_minutes ? String(film.runtime_minutes) : "",
    slug: film.slug || "",
    synopsis: film.synopsis || "",
    title: film.title || "",
  };
}

function validateOwnerFilmForm(form) {
  const errors = {};
  const requiredFields = [
    ["title", "Title"],
    ["slug", "Slug"],
    ["director", "Director"],
    ["releaseYear", "Release year"],
    ["country", "Country"],
    ["runtimeMinutes", "Runtime"],
    ["ageRating", "Age rating"],
    ["genre", "Genre"],
    ["synopsis", "Synopsis"],
    ["posterUrl", "Poster URL"],
  ];

  for (const [field, label] of requiredFields) {
    addRequiredError(errors, field, label, form[field]);
  }

  validateLength(errors, "title", "Title", form.title, 180);
  validateLength(errors, "slug", "Slug", form.slug, 200);
  validateLength(errors, "director", "Director", form.director, 160);
  validateLength(errors, "country", "Country", form.country, 120);
  validateLength(errors, "ageRating", "Age rating", form.ageRating, 20);
  validateLength(errors, "genre", "Genre", form.genre, 100);
  validateLength(errors, "posterUrl", "Poster URL", form.posterUrl, 2000);

  if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
    errors.slug ||= [];
    errors.slug.push("Slug must use lowercase letters, numbers, and single hyphens.");
  }

  const releaseYear = parseFormInteger(form.releaseYear);
  if (form.releaseYear && (releaseYear === null || releaseYear < 1888 || releaseYear > 2100)) {
    errors.releaseYear ||= [];
    errors.releaseYear.push("Release year must be between 1888 and 2100.");
  }

  const runtimeMinutes = parseFormInteger(form.runtimeMinutes);
  if (form.runtimeMinutes && (runtimeMinutes === null || runtimeMinutes <= 0 || runtimeMinutes > 600)) {
    errors.runtimeMinutes ||= [];
    errors.runtimeMinutes.push("Runtime must be between 1 and 600 minutes.");
  }

  return {
    errors,
    values: {
      ...form,
      releaseYear,
      runtimeMinutes,
    },
  };
}

function ownerFilmErrorSummary(errors) {
  return Object.values(errors).flat();
}

function formErrorSummary(errors) {
  return Object.values(errors).flat();
}

function isFilmSlugConflict(error) {
  return error instanceof FilmSlugConflictError || error?.name === "FilmSlugConflictError" || error?.status === 409;
}

function isScreeningConflict(error) {
  return (
    error instanceof ScreeningScheduleConflictError
    || error instanceof ScreeningCapacityConflictError
    || error instanceof ScreeningStatusConflictError
    || error?.name === "ScreeningScheduleConflictError"
    || error?.name === "ScreeningCapacityConflictError"
    || error?.name === "ScreeningStatusConflictError"
  );
}

function isBookingCancellationConflict(error) {
  return error instanceof BookingCancellationConflictError
    || error?.name === "BookingCancellationConflictError"
    || error?.status === 409;
}

function isBookingStatusTransitionConflict(error) {
  return error instanceof BookingStatusTransitionConflictError
    || error?.name === "BookingStatusTransitionConflictError"
    || error?.status === 409;
}

function ownerScreeningFormFromBody(body = {}) {
  return {
    capacity: normalizeText(body.capacity),
    filmId: normalizeText(body.filmId),
    hasGuestTalk: toCheckboxBoolean(body.hasGuestTalk),
    programLabel: normalizeText(body.programLabel),
    startsAt: normalizeText(body.startsAt),
    status: normalizeText(body.status) || "scheduled",
    ticketPriceCents: normalizeText(body.ticketPriceCents),
  };
}

function ownerScreeningFormFromRecord(screening = {}) {
  return {
    capacity: screening.capacity ? String(screening.capacity) : "",
    filmId: screening.film_id ? String(screening.film_id) : "",
    hasGuestTalk: Boolean(screening.has_guest_talk),
    programLabel: screening.program_label || "",
    startsAt: formatDateTimeLocal(screening.starts_at),
    status: screening.status || "scheduled",
    ticketPriceCents: Number.isInteger(screening.ticket_price_cents) ? String(screening.ticket_price_cents) : "",
  };
}

function validateOwnerScreeningForm(form) {
  const errors = {};

  addRequiredError(errors, "filmId", "Film", form.filmId);
  addRequiredError(errors, "startsAt", "Start time", form.startsAt);
  addRequiredError(errors, "capacity", "Capacity", form.capacity);
  addRequiredError(errors, "ticketPriceCents", "Ticket price", form.ticketPriceCents);
  validateLength(errors, "programLabel", "Program label", form.programLabel, 120);

  const filmId = parseFormInteger(form.filmId);
  if (form.filmId && (filmId === null || filmId <= 0)) {
    errors.filmId ||= [];
    errors.filmId.push("Film must be selected from the available catalog.");
  }

  const startsAtDate = form.startsAt ? new Date(form.startsAt) : null;
  if (form.startsAt && Number.isNaN(startsAtDate.getTime())) {
    errors.startsAt ||= [];
    errors.startsAt.push("Start time must be a valid date and time.");
  }

  const capacity = parseFormInteger(form.capacity);
  if (form.capacity && (capacity === null || capacity <= 0 || capacity > 500)) {
    errors.capacity ||= [];
    errors.capacity.push("Capacity must be between 1 and 500.");
  }

  const ticketPriceCents = parseFormInteger(form.ticketPriceCents);
  if (form.ticketPriceCents && (ticketPriceCents === null || ticketPriceCents < 0 || ticketPriceCents > 100000)) {
    errors.ticketPriceCents ||= [];
    errors.ticketPriceCents.push("Ticket price must be between 0 and 100000 cents.");
  }

  if (!isAllowedScreeningStatus(form.status)) {
    errors.status ||= [];
    errors.status.push("Status must be scheduled or cancelled.");
  }

  return {
    errors,
    values: {
      ...form,
      capacity,
      filmId,
      startsAt: startsAtDate,
      ticketPriceCents,
    },
  };
}

function presentOwnerFilm(film) {
  return {
    ...film,
    nextScreeningDisplay: film.next_screening_at ? formatDateTime(film.next_screening_at) : "No upcoming screening",
    publicState: film.is_archived ? "Archived" : "Public",
  };
}

function presentOwnerScreening(screening) {
  const canManageStatus = screening.status === "scheduled" || screening.status === "cancelled";

  return {
    ...screening,
    activeBookingLabel: `${screening.active_booking_count} active`,
    canManageStatus,
    startsAtDisplay: formatDateTime(screening.starts_at),
    statusDisplay: formatStatus(screening.status),
  };
}

function presentMemberBooking(booking) {
  const now = Date.now();
  const startsAtTime = new Date(booking.starts_at).getTime();
  const isCancelled = booking.status === "cancelled";
  const timing = isCancelled ? "Cancelled" : startsAtTime >= now ? "Upcoming" : "Past";

  return {
    ...booking,
    bookedAtDisplay: formatDateTime(booking.booked_at),
    cancelledAtDisplay: booking.cancelled_at ? formatDateTime(booking.cancelled_at) : null,
    startsAtDisplay: formatDateTime(booking.starts_at),
    statusDisplay: formatStatus(booking.status),
    timing,
  };
}

function presentBookingStatusHistoryEntry(entry) {
  const fromStatusDisplay = entry.from_status ? formatStatus(entry.from_status) : "Created";
  const changedByName = [entry.changed_by_first_name, entry.changed_by_last_name].filter(Boolean).join(" ");
  const changedByRole = entry.changed_by_role ? formatStatus(entry.changed_by_role) : null;

  return {
    ...entry,
    changedAtDisplay: formatDateTime(entry.changed_at),
    changedByDisplay: changedByName
      ? `${changedByName}${changedByRole ? ` (${changedByRole})` : ""}`
      : "System record",
    fromStatusDisplay,
    toStatusDisplay: formatStatus(entry.to_status),
  };
}

function staffBookingTransitions(status) {
  if (status === "confirmed") {
    return [
      ["checked_in", "Check In"],
      ["no_show", "Mark No Show"],
    ];
  }

  if (status === "checked_in") {
    return [
      ["completed", "Complete"],
      ["no_show", "Mark No Show"],
    ];
  }

  return [];
}

function presentStaffBooking(booking) {
  const memberName = [booking.member_first_name, booking.member_last_name].filter(Boolean).join(" ");

  return {
    ...booking,
    bookedAtDisplay: formatDateTime(booking.booked_at),
    cancelledAtDisplay: booking.cancelled_at ? formatDateTime(booking.cancelled_at) : null,
    memberDisplay: memberName || booking.member_email || "Member account",
    screeningDisplay: formatDateTime(booking.starts_at),
    statusDisplay: formatStatus(booking.status),
    transitions: staffBookingTransitions(booking.status),
  };
}

export function createMemberAccountController(options = {}) {
  const cancelBooking = options.cancelMemberBooking || cancelMemberBooking;
  const loadBookingStatusHistory = options.findBookingStatusHistoryByBookingId || findBookingStatusHistoryByBookingId;
  const loadBookings = options.findBookingsByUserId || findBookingsByUserId;

  return {
    async showAccount(req, res, next) {
      try {
        const bookings = (await loadBookings(req.currentUser.user_id)).map(presentMemberBooking);

        return res.render("account/member-dashboard", {
          bookings,
          memberName: req.currentUser.first_name,
          pageDescription: "View your cinema account and bookings.",
          pageTitle: "My Account",
        });
      } catch (error) {
        return next(error);
      }
    },

    async showBookingDetail(req, res, next) {
      try {
        const statusHistory = (await loadBookingStatusHistory(req.booking.booking_id))
          .map(presentBookingStatusHistoryEntry);

        return res.render("account/booking-detail", {
          booking: {
            ...presentMemberBooking(req.booking),
            canCancel: Boolean(req.booking.can_cancel),
          },
          pageDescription: "View your booking status and screening details.",
          pageTitle: "Booking Detail",
          statusHistory,
        });
      } catch (error) {
        return next(error);
      }
    },

    async cancelBooking(req, res, next) {
      try {
        const cancelled = await cancelBooking({
          bookingId: req.booking.booking_id,
          userId: req.currentUser.user_id,
        });

        if (!cancelled) {
          return next(createNotFoundError("Booking not found."));
        }

        return res.redirect(303, `/account/bookings/${cancelled.booking_id}`);
      } catch (error) {
        if (isBookingCancellationConflict(error)) {
          return next(error);
        }

        return next(error);
      }
    },
  };
}

export function createStaffOperationsController(options = {}) {
  const loadBookings = options.findStaffOperationalBookings || findStaffOperationalBookings;
  const transitionBookingStatus = options.transitionStaffBookingStatus || transitionStaffBookingStatus;

  return {
    async showDashboard(req, res, next) {
      try {
        const bookings = (await loadBookings()).map(presentStaffBooking);

        return res.render("account/staff-dashboard", {
          bookings,
          pageDescription: "Manage booking check-in and operational status.",
          pageTitle: "Staff Operations",
          staffName: req.currentUser.first_name,
        });
      } catch (error) {
        return next(error);
      }
    },

    async updateBookingStatus(req, res, next) {
      const bookingId = parsePositiveInteger(req.params?.bookingId);
      const toStatus = normalizeText(req.body?.toStatus);

      if (!bookingId) {
        return next(createNotFoundError("Booking not found."));
      }

      try {
        const booking = await transitionBookingStatus({
          bookingId,
          changedByUserId: req.currentUser.user_id,
          toStatus,
        });

        if (!booking) {
          return next(createNotFoundError("Booking not found."));
        }

        return res.redirect(303, "/staff");
      } catch (error) {
        if (isBookingStatusTransitionConflict(error)) {
          return next(error);
        }

        return next(error);
      }
    },
  };
}

export function showOwnerAccount(req, res) {
  res.render("account/landing", {
    eyebrow: "Owner operations",
    heading: `Welcome, ${req.currentUser.first_name}.`,
    message: "Cinema management tools will appear here.",
    pageDescription: "Access cinema owner operations.",
    pageTitle: "Owner",
  });
}

export function createOwnerFilmController(options = {}) {
  const addFilm = options.createFilm || createFilm;
  const loadFilm = options.findOwnerFilmById || findOwnerFilmById;
  const loadFilms = options.findOwnerFilms || findOwnerFilms;
  const archiveFilm = options.setFilmArchived || setFilmArchived;
  const saveFilm = options.updateFilm || updateFilm;

  function renderFilmForm(res, { errors = {}, filmId = null, form, mode, status = 200 }) {
    return res.status(status).render("account/owner-film-form", {
      errors,
      errorSummary: ownerFilmErrorSummary(errors),
      filmId,
      form,
      formAction: mode === "edit" ? `/admin/films/${filmId}` : "/admin/films",
      mode,
      pageDescription: mode === "edit" ? "Edit an Owner-managed film record." : "Create an Owner-managed film record.",
      pageTitle: mode === "edit" ? "Edit Film" : "New Film",
    });
  }

  return {
    async showFilms(req, res, next) {
      try {
        const films = (await loadFilms()).map(presentOwnerFilm);

        return res.render("account/owner-films", {
          films,
          pageDescription: "Manage public film catalog visibility.",
          pageTitle: "Owner Films",
        });
      } catch (error) {
        return next(error);
      }
    },

    showNewFilm(req, res) {
      return renderFilmForm(res, {
        form: ownerFilmFormFromBody(),
        mode: "new",
      });
    },

    async createFilm(req, res, next) {
      const form = ownerFilmFormFromBody(req.body);
      const { errors, values } = validateOwnerFilmForm(form);

      if (Object.keys(errors).length > 0) {
        return renderFilmForm(res, {
          errors,
          form,
          mode: "new",
          status: 422,
        });
      }

      try {
        await addFilm(values);
        return res.redirect(303, "/admin/films");
      } catch (error) {
        if (isFilmSlugConflict(error)) {
          errors.slug = [error.message];
          return renderFilmForm(res, {
            errors,
            form,
            mode: "new",
            status: 409,
          });
        }

        return next(error);
      }
    },

    async showEditFilm(req, res, next) {
      const filmId = parsePositiveInteger(req.params?.filmId);

      if (!filmId) {
        return next(createNotFoundError("Film not found."));
      }

      try {
        const film = await loadFilm(filmId);

        if (!film) {
          return next(createNotFoundError("Film not found."));
        }

        return renderFilmForm(res, {
          filmId,
          form: ownerFilmFormFromRecord(film),
          mode: "edit",
        });
      } catch (error) {
        return next(error);
      }
    },

    async updateFilm(req, res, next) {
      const filmId = parsePositiveInteger(req.params?.filmId);

      if (!filmId) {
        return next(createNotFoundError("Film not found."));
      }

      const form = ownerFilmFormFromBody(req.body);
      const { errors, values } = validateOwnerFilmForm(form);

      if (Object.keys(errors).length > 0) {
        return renderFilmForm(res, {
          errors,
          filmId,
          form,
          mode: "edit",
          status: 422,
        });
      }

      try {
        const film = await saveFilm(filmId, values);

        if (!film) {
          return next(createNotFoundError("Film not found."));
        }

        return res.redirect(303, "/admin/films");
      } catch (error) {
        if (isFilmSlugConflict(error)) {
          errors.slug = [error.message];
          return renderFilmForm(res, {
            errors,
            filmId,
            form,
            mode: "edit",
            status: 409,
          });
        }

        return next(error);
      }
    },

    async updateFilmArchive(req, res, next) {
      const filmId = parsePositiveInteger(req.params?.filmId);

      if (!filmId) {
        return next(createNotFoundError("Film not found."));
      }

      try {
        const film = await archiveFilm(filmId, toBoolean(req.body?.isArchived));

        if (!film) {
          return next(createNotFoundError("Film not found."));
        }

        return res.redirect(303, "/admin/films");
      } catch (error) {
        return next(error);
      }
    },
  };
}

export function createOwnerScreeningController(options = {}) {
  const addScreening = options.createScreening || createScreening;
  const loadFilmOptions = options.findOwnerScreeningFilmOptions || findOwnerScreeningFilmOptions;
  const loadScreening = options.findOwnerScreeningById || findOwnerScreeningById;
  const loadScreenings = options.findOwnerScreenings || findOwnerScreenings;
  const saveScreening = options.updateScreening || updateScreening;
  const updateStatus = options.setScreeningStatus || setScreeningStatus;

  async function renderScreeningForm(res, { errors = {}, form, mode, screeningId = null, status = 200 }) {
    const filmOptions = await loadFilmOptions();

    return res.status(status).render("account/owner-screening-form", {
      errors,
      errorSummary: formErrorSummary(errors),
      filmOptions,
      form,
      formAction: mode === "edit" ? `/admin/screenings/${screeningId}` : "/admin/screenings",
      mode,
      pageDescription: mode === "edit" ? "Edit an Owner-managed screening record." : "Create an Owner-managed screening record.",
      pageTitle: mode === "edit" ? "Edit Screening" : "New Screening",
      screeningId,
    });
  }

  return {
    async showScreenings(req, res, next) {
      try {
        const screenings = (await loadScreenings()).map(presentOwnerScreening);

        return res.render("account/owner-screenings", {
          pageDescription: "Manage screening visibility and cancellation status.",
          pageTitle: "Owner Screenings",
          screenings,
        });
      } catch (error) {
        return next(error);
      }
    },

    async showNewScreening(req, res, next) {
      try {
        return await renderScreeningForm(res, {
          form: ownerScreeningFormFromBody(),
          mode: "new",
        });
      } catch (error) {
        return next(error);
      }
    },

    async createScreening(req, res, next) {
      const form = ownerScreeningFormFromBody(req.body);
      const { errors, values } = validateOwnerScreeningForm(form);

      if (Object.keys(errors).length > 0) {
        return renderScreeningForm(res, {
          errors,
          form,
          mode: "new",
          status: 422,
        }).catch(next);
      }

      try {
        const screening = await addScreening(values);

        if (!screening) {
          errors.filmId = ["Film must be selected from the active catalog."];
          return await renderScreeningForm(res, {
            errors,
            form,
            mode: "new",
            status: 422,
          });
        }

        return res.redirect(303, "/admin/screenings");
      } catch (error) {
        if (isScreeningConflict(error)) {
          errors.startsAt = [error.message];
          return await renderScreeningForm(res, {
            errors,
            form,
            mode: "new",
            status: 409,
          });
        }

        return next(error);
      }
    },

    async showEditScreening(req, res, next) {
      const screeningId = parsePositiveInteger(req.params?.screeningId);

      if (!screeningId) {
        return next(createNotFoundError("Screening not found."));
      }

      try {
        const screening = await loadScreening(screeningId);

        if (!screening || !isAllowedScreeningStatus(screening.status)) {
          return next(createNotFoundError("Screening not found."));
        }

        return await renderScreeningForm(res, {
          form: ownerScreeningFormFromRecord(screening),
          mode: "edit",
          screeningId,
        });
      } catch (error) {
        return next(error);
      }
    },

    async updateScreening(req, res, next) {
      const screeningId = parsePositiveInteger(req.params?.screeningId);

      if (!screeningId) {
        return next(createNotFoundError("Screening not found."));
      }

      const form = ownerScreeningFormFromBody(req.body);
      const { errors, values } = validateOwnerScreeningForm(form);

      if (Object.keys(errors).length > 0) {
        return renderScreeningForm(res, {
          errors,
          form,
          mode: "edit",
          screeningId,
          status: 422,
        }).catch(next);
      }

      try {
        const screening = await saveScreening(screeningId, values);

        if (!screening) {
          return next(createNotFoundError("Screening not found."));
        }

        return res.redirect(303, "/admin/screenings");
      } catch (error) {
        if (isScreeningConflict(error)) {
          const field = error instanceof ScreeningCapacityConflictError || error?.name === "ScreeningCapacityConflictError"
            ? "capacity"
            : "startsAt";
          errors[field] = [error.message];
          return await renderScreeningForm(res, {
            errors,
            form,
            mode: "edit",
            screeningId,
            status: 409,
          });
        }

        return next(error);
      }
    },

    async updateScreeningStatus(req, res, next) {
      const screeningId = parsePositiveInteger(req.params?.screeningId);
      const status = req.body?.status;

      if (!screeningId || !isAllowedScreeningStatus(status)) {
        return next(createNotFoundError("Screening not found."));
      }

      try {
        const screening = await updateStatus(screeningId, status);

        if (!screening) {
          return next(createNotFoundError("Screening not found."));
        }

        return res.redirect(303, "/admin/screenings");
      } catch (error) {
        if (error instanceof ScreeningStatusConflictError) {
          return next(error);
        }

        return next(error);
      }
    },
  };
}

export function showMemberReviewDetail(req, res) {
  res.render("account/review-detail", {
    pageDescription: "View a review detail and verify ownership-protected access.",
    pageTitle: "Review Detail",
    review: {
      ...req.review,
      createdAtDisplay: formatDateTime(req.review.created_at),
      ratingDisplay: `${req.review.rating}/5`,
      visibilityDisplay: req.review.is_visible ? "Visible" : "Hidden",
    },
  });
}
