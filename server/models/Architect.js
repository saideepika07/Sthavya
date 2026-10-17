import mongoose from "mongoose";

const architectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: "Principal Spatial Architect",
    },
    experience: {
      type: Number,
      required: true,
      default: 10,
    },
    rating: {
      type: Number,
      default: 4.95,
    },
    reviewsCount: {
      type: Number,
      default: 85,
    },
    dayRate: {
      type: Number,
      required: true,
      default: 5500,
    },
    location: {
      type: String,
      required: true,
      default: "Bangalore & Mumbai",
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&auto=format",
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
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      default: "",
    },
    availableSlots: [
      {
        date: { type: Date },
        time: { type: String },
        isBooked: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Architect = mongoose.model("Architect", architectSchema);
export default Architect;
