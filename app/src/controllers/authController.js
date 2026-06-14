import bcrypt from "bcryptjs";

import { sessionCookieName } from "../config/session.js";
import { destinationForRole } from "../middleware/authentication.js";
import {
  createMemberUser,
  DuplicateEmailError,
  findUserByEmail,
} from "../models/userModel.js";

const genericLoginError = "Email or password is incorrect.";
const duplicateEmailError = "An account with that email already exists. Sign in instead or use a different email.";
const dummyPasswordHash = "$2b$12$QyDNF1fFW3lZ5RDSfVZgNuNA2HtQm40QBR7c8VuCc/qcGqAnopJka";

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeName(value) {
  return typeof value === "string" ? value.trim() : "";
}

function flattenErrors(errors = {}) {
  return Object.values(errors).flat();
}

function renderLogin(res, options = {}) {
  return res.status(options.status || 200).render("auth/login", {
    errors: options.errors || {},
    form: { email: options.email || "" },
    pageDescription: "Sign in to manage cinema bookings and operations.",
    pageTitle: "Sign In",
  });
}

function renderSignup(res, options = {}) {
  const errors = options.errors || {};

  return res.status(options.status || 200).render("auth/signup", {
    errorSummary: options.errorSummary || flattenErrors(errors),
    errors,
    form: {
      email: options.form?.email || "",
      firstName: options.form?.firstName || "",
      lastName: options.form?.lastName || "",
    },
    pageDescription: "Create a Member account to book screenings and track your cinema history.",
    pageTitle: "Create Account",
  });
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

export function createAuthController(options = {}) {
  const createUser = options.createMemberUser || createMemberUser;
  const findUser = options.findUserByEmail || findUserByEmail;
  const hashPassword = options.hashPassword || bcrypt.hash;
  const verifyPassword = options.verifyPassword || bcrypt.compare;

  return {
    showLogin(req, res) {
      if (req.currentUser) {
        return res.redirect(303, destinationForRole(req.currentUser.role));
      }

      return renderLogin(res);
    },

    showSignup(req, res) {
      if (req.currentUser) {
        return res.redirect(303, destinationForRole(req.currentUser.role));
      }

      return renderSignup(res);
    },

    async login(req, res, next) {
      const email = normalizeEmail(req.body?.email);
      const password = typeof req.body?.password === "string" ? req.body.password : "";

      if (!email || !password) {
        return renderLogin(res, {
          email,
          errors: { form: [genericLoginError] },
          status: 401,
        });
      }

      try {
        const user = await findUser(email);
        const passwordMatches = await verifyPassword(password, user?.password_hash || dummyPasswordHash);

        if (!user?.is_active || !passwordMatches) {
          return renderLogin(res, {
            email,
            errors: { form: [genericLoginError] },
            status: 401,
          });
        }

        await regenerateSession(req);
        req.session.userId = user.user_id;
        await saveSession(req);
        return res.redirect(303, destinationForRole(user.role));
      } catch (error) {
        return next(error);
      }
    },

    async signup(req, res, next) {
      const form = {
        email: normalizeEmail(req.body?.email),
        firstName: normalizeName(req.body?.firstName),
        lastName: normalizeName(req.body?.lastName),
      };
      const password = typeof req.body?.password === "string" ? req.body.password : "";

      if (Object.keys(req.validationErrors || {}).length > 0) {
        return renderSignup(res, {
          errors: req.validationErrors,
          form,
          status: 422,
        });
      }

      try {
        const passwordHash = await hashPassword(password, 12);
        const user = await createUser({
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          passwordHash,
        });

        await regenerateSession(req);
        req.session.userId = user.user_id;
        await saveSession(req);
        return res.redirect(303, destinationForRole(user.role));
      } catch (error) {
        if (
          error instanceof DuplicateEmailError
          || (error.code === "23505" && error.constraint === "users_email_key")
        ) {
          return renderSignup(res, {
            errorSummary: [duplicateEmailError],
            errors: {
              email: [duplicateEmailError],
            },
            form,
            status: 409,
          });
        }

        return next(error);
      }
    },

    logout(req, res, next) {
      req.session.destroy((error) => {
        if (error) {
          return next(error);
        }

        res.clearCookie(sessionCookieName);
        return res.redirect(303, "/");
      });
    },
  };
}
