import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    color: { type: String, default: "#EFECE6" },
    dimensions: { type: String, default: "14' × 12'" },
    sqFt: { type: Number, default: 168 },
    lightRating: { type: String, enum: ["High", "Medium", "Soft"], default: "Medium" },
    recommendedFurniture: [{ type: String }],
    paintHex: { type: String, default: "#F4F3EF" },
    paintName: { type: String, default: "Alabaster Mineral" },
    recommendedTrade: { type: String, default: "Master Modular Carpenter" },
    type: { type: String, default: "living" },
  },
  { _id: false }
);

const floorLevelSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true }, // 0 = Ground, 1 = 1st Floor, ..., 99 = Penthouse
    label: { type: String, required: true }, // e.g. "Ground Floor", "1st Floor", "Penthouse"
    rooms: [roomSchema],
    totalSqFt: { type: Number, default: 0 },
    builtUpAreaSqFt: { type: Number },
    carpetAreaSqFt: { type: Number },
    staircase: { type: mongoose.Schema.Types.Mixed },
    northAngleDeg: { type: Number, default: 0 },
  },
  { _id: false }
);

const housePlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Bespoke Architectural Floor Plan",
    },
    tagline: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    collaborators: [{ type: String }],
    inputs: {
      width: { type: String, default: "30" },
      depth: { type: String, default: "40" },
      budget: { type: String, default: "₹25 - 35 Lakhs" },
      budgetLakhs: { type: Number, default: 30 },
      floors: { type: String, default: "G+1" },
      familySize: { type: String, default: "4 Members" },
      style: {
        type: String,
        default: "Modern",
      },
      region: { type: String, default: "Bangalore" },
      facing: {
        type: String,
        default: "East",
      },
      parking: {
        type: String,
        default: "1 Car + 2 Bikes",
      },
      bhk: {
        type: String,
        default: "3 BHK",
      },
      hasPenthouse: {
        type: Boolean,
        default: false,
      },
      roomPriorities: [{ type: String }],
    },
    floorsCount: {
      type: Number,
      default: 1,
    },
    hasPenthouse: {
      type: Boolean,
      default: false,
    },
    floors: [floorLevelSchema],
    rooms: [roomSchema],
    floorsData: [mongoose.Schema.Types.Mixed],
    totalSqFt: {
      type: Number,
      default: 1200,
    },
    auditResult: {
      overallScore: { type: Number, default: 90 },
      circulationRating: { type: String, default: "Optimal" },
      structuralInsights: [{ type: String }],
      costOptimizationTips: [{ type: String }],
      recommendedTrades: [
        {
          trade: { type: String },
          reason: { type: String },
        },
      ],
      vastuNotes: { type: String },
    },
    blueprintImageUrl: {
      type: String,
      default: "",
    },
    svgContent: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "finalized", "under-review"],
      default: "finalized",
    },
  },
  {
    timestamps: true,
  }
);

// Safe migration hook: wrap legacy single-floor plans into floors[0]
function migrateLegacyFloors(doc) {
  if (!doc) return;
  if ((!doc.floors || doc.floors.length === 0) && doc.rooms && doc.rooms.length > 0) {
    doc.floors = [
      {
        level: 0,
        label: "Ground Floor",
        rooms: doc.rooms,
        totalSqFt: doc.totalSqFt || doc.rooms.reduce((acc, r) => acc + (r.sqFt || 0), 0),
        builtUpAreaSqFt: doc.totalSqFt || 1200,
        carpetAreaSqFt: Math.round((doc.totalSqFt || 1200) * 0.8),
      },
    ];
    doc.floorsCount = doc.floorsCount || 1;
    doc.hasPenthouse = doc.hasPenthouse || false;
  }
}

housePlanSchema.post("init", function () {
  migrateLegacyFloors(this);
});

housePlanSchema.pre("save", function () {
  migrateLegacyFloors(this);
  if (this.floors && this.floors.length > 0) {
    this.floorsCount = this.floors.length;
    if (!this.rooms || this.rooms.length === 0) {
      this.rooms = this.floors[0].rooms;
    }
  }
});

export const HousePlan = mongoose.model("HousePlan", housePlanSchema);
export default HousePlan;
