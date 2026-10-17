import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(optionalAuth, createBooking)
  .get(optionalAuth, getBookings);

router.route("/:id")
  .get(getBookingById);

router.patch("/:id/status", requireAuth, updateBookingStatus);

export default router;
