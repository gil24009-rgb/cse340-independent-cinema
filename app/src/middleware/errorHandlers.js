import { env } from "../config/env.js";

export function notFoundHandler(req, res, next) {
  const error = new Error("Page not found.");
  error.status = 404;
  next(error);
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const template = status === 404 ? "errors/404" : "errors/500";

  res.status(status).render(template, {
    errorMessage: env.isProduction ? null : error.message,
    pageDescription: status === 404
      ? "The requested cinema page could not be found."
      : "The cinema application could not complete this request.",
    pageTitle: status === 404 ? "Page Not Found" : "Server Error",
  });
}
