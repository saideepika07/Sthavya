import mongoose from "mongoose";

const markerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    title: { type: String, required: true },
    dimensions: { type: String, default: "" },
    spaceFeature: { type: String, default: "" },
    craftsman: { type: String, default: "" },
  },
  { _id: false }
);

const savedProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "AI Spatial Interior Concept",
      trim: true,
    },
    roomType: {
      type: String,
      default: "Living Room",
    },
    style: {
      type: String,
      default: "Modern",
    },
    dimensions: {
      type: String,
      default: "16ft × 14ft",
    },
    budgetTier: {
      type: String,
      default: "₹18-25 Lakhs",
    },
    userNotes: {
      type: String,
      default: "",
    },
    enhancedPrompt: {
      type: String,
      default: "",
    },
    designSummary: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    productMarkers: [markerSchema],
    blueprintModifications: [
      {
        id: String,
        zone: String,
        action: String,
        sqFtGained: String,
        trade: String,
      },
    ],
    redesignedRooms: [
      {
        id: String,
        label: String,
        dimensions: String,
        sqFt: Number,
        spaceFeature: String,
        x: Number,
        y: Number,
        w: Number,
        h: Number,
        color: String,
      },
    ],
    totalSqFtGained: {
      type: String,
      default: "",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const SavedProject = mongoose.model("SavedProject", savedProjectSchema);
export default SavedProject;
