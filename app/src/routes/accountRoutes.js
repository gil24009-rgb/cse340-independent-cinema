import express from "express";

import {
  createMemberAccountController,
  createOwnerFilmController,
  createOwnerScreeningController,
  showMemberBookingDetail,
  showMemberReviewDetail,
  showOwnerAccount,
  showStaffAccount,
} from "../controllers/accountController.js";
import { requireRole } from "../middleware/authentication.js";
import { verifyCsrfToken } from "../middleware/csrf.js";
import { createOwnedResourceLoader } from "../middleware/ownership.js";
import { cancelMemberBooking, findBookingById, findBookingsByUserId } from "../models/bookingModel.js";
import { findReviewById } from "../models/reviewModel.js";

export function createAccountRoutes(options = {}) {
  const router = express.Router();
  const memberAccountController = createMemberAccountController({
    cancelMemberBooking: options.cancelMemberBooking || cancelMemberBooking,
    findBookingsByUserId: options.findBookingsByUserId || findBookingsByUserId,
  });
  const ownerFilmController = createOwnerFilmController(options);
  const ownerScreeningController = createOwnerScreeningController(options);
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

  router.get("/account", requireRole("member"), memberAccountController.showAccount);
  router.get("/account/bookings/:bookingId", requireRole("member"), loadOwnedBooking, showMemberBookingDetail);
  router.post(
    "/account/bookings/:bookingId/cancel",
    requireRole("member"),
    verifyCsrfToken,
    loadOwnedBooking,
    memberAccountController.cancelBooking,
  );
  router.get("/account/reviews/:reviewId", requireRole("member"), loadOwnedReview, showMemberReviewDetail);
  router.get("/staff", requireRole("staff", "owner"), showStaffAccount);
  router.get("/admin", requireRole("owner"), showOwnerAccount);
  router.get("/admin/films", requireRole("owner"), ownerFilmController.showFilms);
  router.get("/admin/films/new", requireRole("owner"), ownerFilmController.showNewFilm);
  router.post("/admin/films", requireRole("owner"), verifyCsrfToken, ownerFilmController.createFilm);
  router.get("/admin/films/:filmId/edit", requireRole("owner"), ownerFilmController.showEditFilm);
  router.post("/admin/films/:filmId", requireRole("owner"), verifyCsrfToken, ownerFilmController.updateFilm);
  router.post("/admin/films/:filmId/archive", requireRole("owner"), verifyCsrfToken, ownerFilmController.updateFilmArchive);
  router.get("/admin/screenings", requireRole("owner"), ownerScreeningController.showScreenings);
  router.get("/admin/screenings/new", requireRole("owner"), ownerScreeningController.showNewScreening);
  router.post("/admin/screenings", requireRole("owner"), verifyCsrfToken, ownerScreeningController.createScreening);
  router.get("/admin/screenings/:screeningId/edit", requireRole("owner"), ownerScreeningController.showEditScreening);
  router.post("/admin/screenings/:screeningId", requireRole("owner"), verifyCsrfToken, ownerScreeningController.updateScreening);
  router.post(
    "/admin/screenings/:screeningId/status",
    requireRole("owner"),
    verifyCsrfToken,
    ownerScreeningController.updateScreeningStatus,
  );

  return router;
}

export default createAccountRoutes();
