import { findActiveUserById } from "../models/userModel.js";

const roleDestinations = {
  member: "/account",
  owner: "/admin",
  staff: "/staff",
};

export function destinationForRole(role) {
  return roleDestinations[role] || "/account";
}

export function createCurrentUserLoader(options = {}) {
  const findUser = options.findActiveUserById || findActiveUserById;

  return async function loadCurrentUser(req, res, next) {
    const userId = req.session?.userId;

    if (!Number.isInteger(userId)) {
      return next();
    }

    try {
      const user = await findUser(userId);

      if (!user) {
        delete req.session.userId;
        return next();
      }

      req.currentUser = user;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export function requireAuthentication(req, res, next) {
  if (req.currentUser) {
    return next();
  }

  return res.redirect(303, "/login");
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.currentUser) {
      return res.redirect(303, "/login");
    }

    if (!allowedRoles.includes(req.currentUser.role)) {
      const error = new Error("You do not have permission to access this page.");
      error.status = 403;
      return next(error);
    }

    return next();
  };
}
