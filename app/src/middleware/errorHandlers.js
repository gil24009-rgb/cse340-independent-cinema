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
  if (status >= 500) {
    console.error("Request failed.", {
      code: error.code,
      message: error.message,
      name: error.name,
      path: req.path,
    });
  }

  const template = status === 403
    ? "errors/403"
    : status === 404
      ? "errors/404"
      : "errors/500";

  const context = {
    errorMessage: env.isProduction ? null : error.message,
    pageDescription: status === 403
      ? "This cinema page is not available to the current account."
      : status === 404
        ? "The requested cinema page could not be found."
        : "The cinema application could not complete this request.",
    pageTitle: status === 403 ? "Forbidden" : status === 404 ? "Page Not Found" : "Server Error",
  };

  res.status(status).render(template, context, (renderError, html) => {
    if (renderError) {
      console.error("Error page rendering failed.", renderError);
      return res.status(status).type("text").send(
        status === 403 ? "Forbidden." : status === 404 ? "Page not found." : "Server error.",
      );
    }

    return res.send(html);
  });
}
