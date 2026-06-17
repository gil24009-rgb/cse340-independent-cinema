import { findOwnerFilms, setFilmArchived } from "../models/filmModel.js";
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

function isAllowedScreeningStatus(value) {
  return value === "scheduled" || value === "cancelled";
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
  const loadFilms = options.findOwnerFilms || findOwnerFilms;
  const archiveFilm = options.setFilmArchived || setFilmArchived;

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
