import bcrypt from "bcryptjs";

import { sessionCookieName } from "../config/session.js";
import { destinationForRole } from "../middleware/authentication.js";
import { findUserByEmail } from "../models/userModel.js";

const genericLoginError = "Email or password is incorrect.";
const dummyPasswordHash = "$2b$12$QyDNF1fFW3lZ5RDSfVZgNuNA2HtQm40QBR7c8VuCc/qcGqAnopJka";

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function renderLogin(res, options = {}) {
  return res.status(options.status || 200).render("auth/login", {
    errors: options.errors || {},
    form: { email: options.email || "" },
    pageDescription: "Sign in to manage cinema bookings and operations.",
    pageTitle: "Sign In",
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
  const findUser = options.findUserByEmail || findUserByEmail;
  const verifyPassword = options.verifyPassword || bcrypt.compare;

  return {
    showLogin(req, res) {
      if (req.currentUser) {
        return res.redirect(303, destinationForRole(req.currentUser.role));
      }

      return renderLogin(res);
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
