import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      default: "anonymous",
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
      default: "",
    },
    workerId: {
      type: String,
      required: true,
      index: true,
    },
    workerName: {
      type: String,
      required: true,
    },
    workerRole: {
      type: String,
      default: "",
    },
    workerCategory: {
      type: String,
      default: "Architect",
    },
    days: {
      type: Number,
      required: true,
      default: 5,
    },
    dayRate: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    scopeContext: {
      type: String,
      default: "General Architectural & Interior Consultation",
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In-Progress", "Completed", "Cancelled"],
      default: "Confirmed",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
