import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";
import { addViewContext } from "./middleware/viewContext.js";
import siteRoutes from "./routes/siteRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("view engine", "ejs");
  app.set("views", path.join(appRoot, "views"));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: "100kb" }));
  app.use(express.static(path.join(appRoot, "public")));
  app.use(addViewContext);

  app.use(siteRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { env };
