import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

import { env } from "./config/env.js";
import { createSessionMiddleware } from "./config/session.js";
import { createCurrentUserLoader } from "./middleware/authentication.js";
import { addCsrfToken } from "./middleware/csrf.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";
import { addViewContext } from "./middleware/viewContext.js";
import accountRoutes from "./routes/accountRoutes.js";
import { createAuthRoutes } from "./routes/authRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");

export function createApp(options = {}) {
  const app = express();

  app.disable("x-powered-by");
  if (env.isProduction) {
    app.set("trust proxy", 1);
  }
  app.set("view engine", "ejs");
  app.set("views", path.join(appRoot, "views"));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: "100kb" }));
  app.use(express.static(path.join(appRoot, "public")));
  app.use(createSessionMiddleware(options.session));
  app.use(createCurrentUserLoader(options.users));
  app.use(addCsrfToken);
  app.use(addViewContext);

  app.use(createAuthRoutes(options.auth));
  app.use(accountRoutes);
  app.use(siteRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { env };
