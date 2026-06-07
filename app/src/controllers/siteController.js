import {
  checkDatabaseConnection,
  isDatabaseConfigured,
} from "../config/database.js";

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

const placeholderPages = {
  films: {
    eyebrow: "Film archive",
    heading: "The program is taking shape.",
    message: "Films will appear here as soon as the first program is published.",
    pageDescription: "Browse films in the independent cinema program.",
    pageTitle: "Films",
  },
  login: {
    eyebrow: "Member access",
    heading: "Keep your screenings close.",
    message: "Member access will connect bookings, screening history, and reviews in one place.",
    pageDescription: "Sign in to manage independent cinema bookings.",
    pageTitle: "Sign In",
  },
  screenings: {
    eyebrow: "Screening schedule",
    heading: "The next schedule is almost ready.",
    message: "Published screening dates and availability will appear here.",
    pageDescription: "View the independent cinema screening schedule.",
    pageTitle: "Screenings",
  },
};

export function showPlaceholder(req, res, next) {
  const page = placeholderPages[req.path.slice(1)];

  if (!page) {
    return next();
  }

  res.render("placeholder", {
    ...page,
  });
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
