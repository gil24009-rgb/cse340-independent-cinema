import express from "express";

import {
  createPublicSiteController,
  showDatabaseHealth,
  showHealth,
} from "../controllers/siteController.js";
import { requireRole } from "../middleware/authentication.js";
import { verifyCsrfToken } from "../middleware/csrf.js";
import {
  requiredText,
  validEmail,
  validateRequest,
} from "../middleware/validation.js";

const contactValidationRules = {
  body: [requiredText("Message", { maxLength: 2000, minLength: 10 })],
  email: [
    requiredText("Email", { maxLength: 254 }),
    validEmail(),
  ],
  name: [requiredText("Name", { maxLength: 160 })],
  subject: [requiredText("Subject", { maxLength: 180 })],
};

export function createSiteRoutes(options = {}) {
  const router = express.Router();
  const publicController = createPublicSiteController(options);

  router.get("/", publicController.showHome);
  router.get("/visit", publicController.showVisit);
  router.post("/visit", verifyCsrfToken, validateRequest(contactValidationRules), publicController.submitContact);
  router.get("/films", publicController.showFilms);
  router.get("/films/:filmSlug", publicController.showFilmDetail);
  router.get("/screenings", publicController.showScreenings);
  router.get("/screenings/:screeningId", publicController.showScreeningDetail);
  router.post("/screenings/:screeningId/bookings", requireRole("member"), verifyCsrfToken, publicController.createBooking);
  router.get("/health", showHealth);
  router.get("/health/database", showDatabaseHealth);

  return router;
}

export default createSiteRoutes();
