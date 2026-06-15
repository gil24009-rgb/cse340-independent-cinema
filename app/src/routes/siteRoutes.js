import express from "express";

import {
  createPublicSiteController,
  showDatabaseHealth,
  showHealth,
  showHome,
  showVisit,
} from "../controllers/siteController.js";

export function createSiteRoutes(options = {}) {
  const router = express.Router();
  const publicController = createPublicSiteController(options);

  router.get("/", showHome);
  router.get("/visit", showVisit);
  router.get("/films", publicController.showFilms);
  router.get("/screenings", publicController.showScreenings);
  router.get("/health", showHealth);
  router.get("/health/database", showDatabaseHealth);

  return router;
}

export default createSiteRoutes();
