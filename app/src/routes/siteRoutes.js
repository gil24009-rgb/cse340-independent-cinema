import express from "express";

import {
  showDatabaseHealth,
  showHealth,
  showHome,
  showPlaceholder,
  showVisit,
} from "../controllers/siteController.js";

const router = express.Router();

router.get("/", showHome);
router.get("/visit", showVisit);
router.get(["/films", "/screenings"], showPlaceholder);
router.get("/health", showHealth);
router.get("/health/database", showDatabaseHealth);

export default router;
