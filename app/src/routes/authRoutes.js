import express from "express";

import { createAuthController } from "../controllers/authController.js";
import { verifyCsrfToken } from "../middleware/csrf.js";

export function createAuthRoutes(options = {}) {
  const router = express.Router();
  const controller = createAuthController(options);

  router.get("/login", controller.showLogin);
  router.post("/login", verifyCsrfToken, controller.login);
  router.post("/logout", verifyCsrfToken, controller.logout);

  return router;
}
