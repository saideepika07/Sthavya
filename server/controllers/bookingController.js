import { z } from "zod";
import Booking from "../models/Booking.js";
import { getIO } from "../server.js";

export const BookingSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  clientPhone: z.string().min(7, "Client phone must be at least 7 digits"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  workerId: z.string().min(1, "Worker ID is required"),
  workerName: z.string().min(1, "Worker name is required"),
  workerRole: z.string().optional(),
  workerCategory: z.string().default("Architect"),
  days: z.number().min(1).max(90).default(5),
  dayRate: z.number().min(0).max(1000000).default(3500),
  scopeContext: z.string().default("Space Planning & Interior Consultation"),
  notes: z.string().optional(),
});

/**
 * @desc    Create new architect/specialist consultation booking
 * @route   POST /api/bookings
 * @access  Optional Auth / Public
 */
export const createBooking = async (req, res) => {
  try {
    const validated = BookingSchema.parse(req.body);

    const calculatedDays = Math.round(validated.days);
    const totalCost = calculatedDays * validated.dayRate;
    const bookingRef = `STHAVYA-IN-${Math.floor(100000 + Math.random() * 900000)}`;
    const userId = req.user?._id?.toString() || req.body.userId || "anonymous";

    const booking = await Booking.create({
      bookingRef,
      userId,
      clientName: validated.clientName,
      clientPhone: validated.clientPhone,
      clientEmail: validated.clientEmail || "",
      workerId: validated.workerId,
      workerName: validated.workerName,
      workerRole: validated.workerRole || "Architectural Specialist",
      workerCategory: validated.workerCategory || "Architect",
      days: calculatedDays,
      dayRate: validated.dayRate,
      totalCost,
      scopeContext: validated.scopeContext,
      status: "Confirmed",
      scheduledDate: new Date(),
      notes: validated.notes || "",
    });

    // Broadcast live update via Socket.io
    try {
      const io = getIO();
      if (io) {
        io.emit("booking:created", booking);
        io.to(`user:${userId}`).emit("booking:update", booking);
        io.to(`worker:${validated.workerId}`).emit("booking:update", booking);
      }
    } catch (socketErr) {
      console.warn("Socket broadcast error:", socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Consultation booked successfully.",
      booking,
    });
  } catch (error) {
    const statusCode = error.name === "ZodError" ? 422 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create consultation booking.",
      details: error.name === "ZodError" ? error.errors : undefined,
    });
  }
};

/**
 * @desc    Get all bookings (with optional filter by userId or clientPhone or role)
 * @route   GET /api/bookings
 * @access  Optional Auth
 */
export const getBookings = async (req, res) => {
  try {
    const filter = {};

    if (req.user) {
      if (req.user.role === "client") {
        filter.$or = [{ userId: req.user._id.toString() }, { clientEmail: req.user.email }];
      } else if (req.user.role === "worker" || req.user.role === "architect") {
        filter.workerId = req.user._id.toString();
      }
      // admins see all
    } else {
      if (req.query.userId) filter.userId = req.query.userId;
      if (req.query.phone) filter.clientPhone = req.query.phone;
      if (req.query.workerId) filter.workerId = req.query.workerId;
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(100);

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get booking by ID or reference number
 * @route   GET /api/bookings/:id
 * @access  Public / Optional Auth
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = null;

    if (id.startsWith("STHAVYA-IN-") || id.startsWith("NIVORA-IN-")) {
      booking = await Booking.findOne({ bookingRef: id });
    } else {
      booking = await Booking.findById(id);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update booking status (Real-Time update)
 * @route   PATCH /api/bookings/:id/status
 * @access  Private
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["Pending", "Confirmed", "In-Progress", "Completed", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    booking.status = status;
    if (notes) booking.notes = notes;
    await booking.save();

    // Broadcast status change in real time via Socket.io
    try {
      const io = getIO();
      if (io) {
        io.emit("booking:status-changed", {
          bookingId: booking._id,
          bookingRef: booking.bookingRef,
          status: booking.status,
          booking,
        });
        io.to(`user:${booking.userId}`).emit("booking:update", booking);
      }
    } catch (socketErr) {
      console.warn("Socket broadcast error:", socketErr.message);
    }

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
      error: error.message,
    });
  }
};

export default {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
};
