import express from "express";

import { createAuthController } from "../controllers/authController.js";
import { verifyCsrfToken } from "../middleware/csrf.js";
import {
  matchesField,
  passwordLength,
  requiredText,
  requiredValue,
  validEmail,
  validateRequest,
} from "../middleware/validation.js";

const signupValidationRules = {
  firstName: [requiredText("First name", { maxLength: 80 })],
  lastName: [requiredText("Last name", { maxLength: 80 })],
  email: [
    requiredText("Email", { maxLength: 254 }),
    validEmail(),
  ],
  password: [
    requiredValue("Password", { maxLength: 72 }),
    passwordLength("Password"),
  ],
  confirmPassword: [
    requiredValue("Password confirmation", { maxLength: 72 }),
    matchesField("Password confirmation", "password", "Password"),
  ],
};

export function createAuthRoutes(options = {}) {
  const router = express.Router();
  const controller = createAuthController(options);

  router.get("/login", controller.showLogin);
  router.get("/signup", controller.showSignup);
  router.post("/login", verifyCsrfToken, controller.login);
  router.post("/signup", verifyCsrfToken, validateRequest(signupValidationRules), controller.signup);
  router.post("/logout", verifyCsrfToken, controller.logout);

  return router;
}
