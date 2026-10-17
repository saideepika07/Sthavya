import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Architect", "Plumber", "Carpenter", "Contractor", "Electrician", "Painter", "Ceiling"],
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
      default: 5,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewsCount: {
      type: Number,
      default: 50,
    },
    dayRate: {
      type: Number,
      required: true,
      default: 3000,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      default: "Bangalore",
    },
    avatar: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: true,
    },
    specialties: [{ type: String }],
    recentProject: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "+91 98765 43210",
    },
    status: {
      type: String,
      enum: ["available", "busy", "on-leave"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

export const Worker = mongoose.model("Worker", workerSchema);
export default Worker;
