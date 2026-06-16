import {
  checkDatabaseConnection,
  isDatabaseConfigured,
} from "../config/database.js";
import { findPublicFilmBySlug, findPublicFilms } from "../models/filmModel.js";
import {
  findPublicScreeningById,
  findPublicScreeningsByFilmId,
  findPublicUpcomingScreenings,
} from "../models/screeningModel.js";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "America/Boise",
  weekday: "short",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Boise",
});
const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function createNotFoundError(message = "Page not found.") {
  const error = new Error(message);
  error.status = 404;
  return error;
}

function presentFilm(film) {
  return {
    ...film,
    nextScreeningHref: film.next_screening_id ? `/screenings/${film.next_screening_id}` : null,
    nextScreeningLabel: film.next_screening_at
      ? `${dateFormatter.format(film.next_screening_at)} · ${timeFormatter.format(film.next_screening_at)}`
      : null,
  };
}

function presentScreening(screening) {
  return {
    ...screening,
    availabilityLabel: screening.remaining_capacity > 0
      ? `${screening.remaining_capacity} seats available`
      : "Sold out",
    dateLabel: dateFormatter.format(screening.starts_at),
    priceLabel: currencyFormatter.format(screening.ticket_price_cents / 100),
    timeLabel: timeFormatter.format(screening.starts_at),
  };
}

export function showVisit(req, res) {
  res.render("visit", {
    pageDescription: "Plan your visit and understand how screenings operate.",
    pageTitle: "Visit",
  });
}

export function createPublicSiteController(options = {}) {
  const loadFilmBySlug = options.findPublicFilmBySlug || findPublicFilmBySlug;
  const loadFilms = options.findPublicFilms || findPublicFilms;
  const loadScreeningById = options.findPublicScreeningById || findPublicScreeningById;
  const loadScreeningsByFilmId = options.findPublicScreeningsByFilmId || findPublicScreeningsByFilmId;
  const loadScreenings = options.findPublicUpcomingScreenings || findPublicUpcomingScreenings;

  return {
    async showHome(req, res, next) {
      try {
        const [films, screenings] = await Promise.all([
          loadFilms(),
          loadScreenings(),
        ]);
        const presentedFilms = films.map(presentFilm);
        const presentedScreenings = screenings.map(presentScreening);

        res.render("home", {
          featuredFilm: presentedFilms.find((film) => film.is_featured) || presentedFilms[0] || null,
          nextScreening: presentedScreenings[0] || null,
          pageDescription: "Independent films, clear schedules, and a direct booking path.",
          pageTitle: "Now Showing",
          programFilms: presentedFilms.slice(0, 3),
          upcomingScreenings: presentedScreenings.slice(0, 3),
        });
      } catch (error) {
        next(error);
      }
    },

    async showFilms(req, res, next) {
      try {
        const films = (await loadFilms()).map(presentFilm);

        res.render("films/index", {
          films,
          pageDescription: "Browse films in the independent cinema program.",
          pageTitle: "Films",
        });
      } catch (error) {
        next(error);
      }
    },

    async showScreenings(req, res, next) {
      try {
        const screenings = (await loadScreenings()).map(presentScreening);

        res.render("screenings/index", {
          pageDescription: "View upcoming independent cinema screenings and availability.",
          pageTitle: "Screenings",
          screenings,
        });
      } catch (error) {
        next(error);
      }
    },

    async showFilmDetail(req, res, next) {
      const filmSlug = req.params?.filmSlug;

      if (!slugPattern.test(filmSlug || "")) {
        return next(createNotFoundError("Film not found."));
      }

      try {
        const film = await loadFilmBySlug(filmSlug);

        if (!film) {
          return next(createNotFoundError("Film not found."));
        }

        const screenings = (await loadScreeningsByFilmId(film.film_id)).map(presentScreening);

        return res.render("films/detail", {
          film: presentFilm(film),
          pageDescription: `View ${film.title} and its upcoming screenings.`,
          pageTitle: film.title,
          screenings,
        });
      } catch (error) {
        return next(error);
      }
    },

    async showScreeningDetail(req, res, next) {
      const screeningId = Number(req.params?.screeningId);

      if (!Number.isInteger(screeningId) || screeningId < 1) {
        return next(createNotFoundError("Screening not found."));
      }

      try {
        const screening = await loadScreeningById(screeningId);

        if (!screening) {
          return next(createNotFoundError("Screening not found."));
        }

        return res.render("screenings/detail", {
          pageDescription: `View the ${screening.film_title} screening and current availability.`,
          pageTitle: screening.film_title,
          screening: presentScreening(screening),
        });
      } catch (error) {
        return next(error);
      }
    },
  };
}

export function showHealth(req, res) {
  res.json({
    databaseConfigured: isDatabaseConfigured(),
    environment: res.locals.environment,
    status: "ok",
  });
}

export async function showDatabaseHealth(req, res, next) {
  try {
    const result = await checkDatabaseConnection();

    res.json({
      checkedAt: result.checked_at,
      status: "ok",
    });
  } catch (error) {
    next(error);
  }
}
