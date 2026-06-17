import express from "express";

import {
  createOwnerFilmController,
  showMemberBookingDetail,
  showMemberAccount,
  showMemberReviewDetail,
  showOwnerAccount,
  showStaffAccount,
} from "../controllers/accountController.js";
import { requireRole } from "../middleware/authentication.js";
import { verifyCsrfToken } from "../middleware/csrf.js";
import { createOwnedResourceLoader } from "../middleware/ownership.js";
import { findBookingById } from "../models/bookingModel.js";
import { findReviewById } from "../models/reviewModel.js";

export function createAccountRoutes(options = {}) {
  const router = express.Router();
  const ownerFilmController = createOwnerFilmController(options);
  const loadOwnedBooking = createOwnedResourceLoader({
    findResourceById: options.findBookingById || findBookingById,
    paramName: "bookingId",
    requestKey: "booking",
    resourceLabel: "Booking",
  });
  const loadOwnedReview = createOwnedResourceLoader({
    findResourceById: options.findReviewById || findReviewById,
    paramName: "reviewId",
    requestKey: "review",
    resourceLabel: "Review",
  });

  router.get("/account", requireRole("member"), showMemberAccount);
  router.get("/account/bookings/:bookingId", requireRole("member"), loadOwnedBooking, showMemberBookingDetail);
  router.get("/account/reviews/:reviewId", requireRole("member"), loadOwnedReview, showMemberReviewDetail);
  router.get("/staff", requireRole("staff", "owner"), showStaffAccount);
  router.get("/admin", requireRole("owner"), showOwnerAccount);
  router.get("/admin/films", requireRole("owner"), ownerFilmController.showFilms);
  router.post("/admin/films/:filmId/archive", requireRole("owner"), verifyCsrfToken, ownerFilmController.updateFilmArchive);

  return router;
}

export default createAccountRoutes();
