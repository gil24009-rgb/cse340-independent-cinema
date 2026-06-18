import {
  createFilm,
  FilmSlugConflictError,
  findOwnerFilmById,
  findOwnerFilms,
  setFilmArchived,
  updateFilm,
} from "../models/filmModel.js";
import {
  findOwnerScreenings,
  ScreeningStatusConflictError,
  setScreeningStatus,
} from "../models/screeningModel.js";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDateTime(value) {
  return value ? dateTimeFormatter.format(new Date(value)) : "Not available";
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

function isFilmSlugConflict(error) {
  return error instanceof FilmSlugConflictError || error?.name === "FilmSlugConflictError" || error?.status === 409;
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

export function showMemberAccount(req, res) {
  res.render("account/landing", {
    eyebrow: "Member account",
    heading: `Welcome, ${req.currentUser.first_name}.`,
    message: "Your bookings and screening history will appear here.",
    pageDescription: "View your cinema account and bookings.",
    pageTitle: "My Account",
  });
}

export function showStaffAccount(req, res) {
  res.render("account/landing", {
    eyebrow: "Staff operations",
    heading: `Welcome, ${req.currentUser.first_name}.`,
    message: "Today's screenings and booking operations will appear here.",
    pageDescription: "Access cinema staff operations.",
    pageTitle: "Staff",
  });
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
  const loadScreenings = options.findOwnerScreenings || findOwnerScreenings;
  const updateStatus = options.setScreeningStatus || setScreeningStatus;

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

export function showMemberBookingDetail(req, res) {
  res.render("account/booking-detail", {
    booking: {
      ...req.booking,
      bookedAtDisplay: formatDateTime(req.booking.booked_at),
      cancelledAtDisplay: req.booking.cancelled_at ? formatDateTime(req.booking.cancelled_at) : null,
      startsAtDisplay: formatDateTime(req.booking.starts_at),
      statusDisplay: formatStatus(req.booking.status),
    },
    pageDescription: "View a booking detail and verify ownership-protected access.",
    pageTitle: "Booking Detail",
  });
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
