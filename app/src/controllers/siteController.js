import {
  checkDatabaseConnection,
  isDatabaseConfigured,
} from "../config/database.js";
import { findPublicFilms } from "../models/filmModel.js";
import { findPublicUpcomingScreenings } from "../models/screeningModel.js";

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

function presentFilm(film) {
  return {
    ...film,
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
    timeLabel: timeFormatter.format(screening.starts_at),
  };
}

export function showHome(req, res) {
  res.render("home", {
    pageDescription: "Independent films, clear schedules, and a direct booking path.",
    pageTitle: "Now Showing",
  });
}

export function showVisit(req, res) {
  res.render("visit", {
    pageDescription: "Plan your visit and understand how screenings operate.",
    pageTitle: "Visit",
  });
}

export function createPublicSiteController(options = {}) {
  const loadFilms = options.findPublicFilms || findPublicFilms;
  const loadScreenings = options.findPublicUpcomingScreenings || findPublicUpcomingScreenings;

  return {
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
