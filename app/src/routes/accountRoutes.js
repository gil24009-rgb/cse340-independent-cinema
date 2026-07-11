import express from "express";

import {
  createMemberAccountController,
  createOwnerFilmController,
  createOwnerScreeningController,
  createStaffOperationsController,
  showMemberReviewDetail,
  showOwnerAccount,
} from "../controllers/accountController.js";
import { requireRole } from "../middleware/authentication.js";
import { verifyCsrfToken } from "../middleware/csrf.js";
import { createOwnedResourceLoader } from "../middleware/ownership.js";
import {
  cancelMemberBooking,
  findBookingById,
  findBookingStatusHistoryByBookingId,
  findBookingsByUserId,
  findStaffOperationalBookings,
  transitionStaffBookingStatus,
} from "../models/bookingModel.js";
import {
  findStaffContactMessages,
  updateContactMessageStatus,
} from "../models/contactMessageModel.js";
import {
  createMemberReview,
  deleteMemberReview,
  findReviewById,
  findReviewableFilmsByUserId,
  findReviewsByUserId,
  findStaffReviewModerationQueue,
  setReviewVisibility,
  updateMemberReview,
} from "../models/reviewModel.js";

export function createAccountRoutes(options = {}) {
  const router = express.Router();
  const memberAccountController = createMemberAccountController({
    cancelMemberBooking: options.cancelMemberBooking || cancelMemberBooking,
    createMemberReview: options.createMemberReview || createMemberReview,
    deleteMemberReview: options.deleteMemberReview || deleteMemberReview,
    findBookingStatusHistoryByBookingId:
      options.findBookingStatusHistoryByBookingId || findBookingStatusHistoryByBookingId,
    findBookingsByUserId: options.findBookingsByUserId || findBookingsByUserId,
    findReviewableFilmsByUserId: options.findReviewableFilmsByUserId || findReviewableFilmsByUserId,
    findReviewsByUserId: options.findReviewsByUserId || findReviewsByUserId,
    updateMemberReview: options.updateMemberReview || updateMemberReview,
  });
  const staffOperationsController = createStaffOperationsController({
    findStaffContactMessages: options.findStaffContactMessages || findStaffContactMessages,
    findStaffOperationalBookings: options.findStaffOperationalBookings || findStaffOperationalBookings,
    findStaffReviewModerationQueue: options.findStaffReviewModerationQueue || findStaffReviewModerationQueue,
    setReviewVisibility: options.setReviewVisibility || setReviewVisibility,
    transitionStaffBookingStatus: options.transitionStaffBookingStatus || transitionStaffBookingStatus,
    updateContactMessageStatus: options.updateContactMessageStatus || updateContactMessageStatus,
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
  router.get("/account/bookings/:bookingId", requireRole("member"), loadOwnedBooking, memberAccountController.showBookingDetail);
  router.post(
    "/account/bookings/:bookingId/cancel",
    requireRole("member"),
    verifyCsrfToken,
    loadOwnedBooking,
    memberAccountController.cancelBooking,
  );
  router.get("/account/reviews/new", requireRole("member"), memberAccountController.showNewReview);
  router.post("/account/reviews", requireRole("member"), verifyCsrfToken, memberAccountController.createReview);
  router.get("/account/reviews/:reviewId", requireRole("member"), loadOwnedReview, showMemberReviewDetail);
  router.get("/account/reviews/:reviewId/edit", requireRole("member"), loadOwnedReview, memberAccountController.showEditReview);
  router.post(
    "/account/reviews/:reviewId",
    requireRole("member"),
    verifyCsrfToken,
    loadOwnedReview,
    memberAccountController.updateReview,
  );
  router.post(
    "/account/reviews/:reviewId/delete",
    requireRole("member"),
    verifyCsrfToken,
    loadOwnedReview,
    memberAccountController.deleteReview,
  );
  router.get("/staff", requireRole("staff", "owner"), staffOperationsController.showDashboard);
  router.post(
    "/staff/bookings/:bookingId/status",
    requireRole("staff", "owner"),
    verifyCsrfToken,
    staffOperationsController.updateBookingStatus,
  );
  router.post(
    "/staff/reviews/:reviewId/visibility",
    requireRole("staff", "owner"),
    verifyCsrfToken,
    staffOperationsController.updateReviewVisibility,
  );
  router.post(
    "/staff/messages/:messageId/status",
    requireRole("staff", "owner"),
    verifyCsrfToken,
    staffOperationsController.updateContactMessage,
  );
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
