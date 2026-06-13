import connectPgSimple from "connect-pg-simple";
import session from "express-session";

import { env } from "./env.js";
import { getPool, isDatabaseConfigured } from "./database.js";

export const sessionCookieName = "cinema_session";

export function createSessionMiddleware(options = {}) {
  const sessionSecret = options.sessionSecret || env.sessionSecret;

  if (!sessionSecret) {
    throw new Error("SESSION_SECRET is required.");
  }

  if (env.isProduction && !isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is required for production session storage.");
  }

  let store = options.store;

  if (!store && isDatabaseConfigured()) {
    const PostgreSqlStore = connectPgSimple(session);
    store = new PostgreSqlStore({
      createTableIfMissing: true,
      pool: getPool(),
      tableName: "user_sessions",
    });
  }

  return session({
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8,
      sameSite: "lax",
      secure: env.isProduction,
    },
    name: sessionCookieName,
    resave: false,
    saveUninitialized: false,
    secret: sessionSecret,
    store,
  });
}
