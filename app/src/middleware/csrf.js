import { randomBytes, timingSafeEqual } from "node:crypto";

function tokensMatch(expected, received) {
  if (typeof expected !== "string" || typeof received !== "string") {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return expectedBuffer.length === receivedBuffer.length
    && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function addCsrfToken(req, res, next) {
  if (!req.currentUser && !["/login", "/signup", "/visit"].includes(req.path)) {
    res.locals.csrfToken = "";
    return next();
  }

  // Anonymous auth forms intentionally bind CSRF to a pre-auth session row.
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString("hex");
  }

  res.locals.csrfToken = req.session.csrfToken;
  return next();
}

export function verifyCsrfToken(req, res, next) {
  if (tokensMatch(req.session?.csrfToken, req.body?.csrfToken)) {
    return next();
  }

  const error = new Error("The form expired. Please try again.");
  error.status = 403;
  return next(error);
}
