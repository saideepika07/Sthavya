import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Worker from "../models/Worker.js";
import Architect from "../models/Architect.js";
import HousePlan from "../models/HousePlan.js";
import Booking from "../models/Booking.js";
import { DEFAULT_WORKERS } from "../controllers/workerController.js";

dotenv.config();

const SEED_USERS = [
  {
    name: "Deepika Reddy",
    email: "deepika.reddy@example.com",
    password: "Password@123",
    role: "client",
    phone: "+91 98765 43210",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&auto=format",
    preferences: {
      preferredStyle: "Modern",
      budgetTier: "₹35 - 45 Lakhs",
      region: "Bangalore (High Cost)",
    },
  },
  {
    name: "Ar. Elena Rostova",
    email: "elena.rostova@sthavya.example",
    password: "Password@123",
    role: "architect",
    phone: "+91 22 4910 8201",
    city: "Mumbai & Bangalore",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&auto=format",
  },
  {
    name: "Master Julian Vance",
    email: "julian.vance@sthavya.example",
    password: "Password@123",
    role: "worker",
    phone: "+91 80 4910 8205",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1547609434-b732edfee020?w=160&h=160&fit=crop&auto=format",
  },
  {
    name: "STHAVYA Platform Admin",
    email: "admin@sthavya.example",
    password: "AdminPassword@123",
    role: "admin",
    phone: "+91 80 8000 9000",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&auto=format",
  },
];

const SEED_ARCHITECTS = [
  {
    name: "Ar. Elena Rostova",
    role: "Principal Interior Architect & Spatial Planner",
    experience: 14,
    rating: 4.98,
    reviewsCount: 164,
    dayRate: 5500,
    location: "Bangalore & Mumbai",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Constraint Solving", "Vastu & Code Norms", "Structural Adjacencies", "CAD Feasibility"],
    recentProject: "Duplex Space Expansion & Lightwell, Indiranagar",
    bio: "Council of Architecture registered architect specializing in high-density residential layouts and daylight harvesting.",
    contactEmail: "elena.rostova@sthavya.example",
    contactPhone: "+91 22 4910 8201",
    availableSlots: [
      { date: new Date(Date.now() + 86400000), time: "10:00 AM", isBooked: false },
      { date: new Date(Date.now() + 86400000), time: "02:30 PM", isBooked: false },
      { date: new Date(Date.now() + 172800000), time: "11:30 AM", isBooked: false },
    ],
  },
  {
    name: "Ar. Aarav Deshmukh",
    role: "Chief Sustainable Architect & Modular Specialist",
    experience: 16,
    rating: 4.97,
    reviewsCount: 128,
    dayRate: 6000,
    location: "Bangalore & Hyderabad",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Biophilic Architecture", "Acoustic Attenuation", "Passive Cooling", "Turnkey Planning"],
    recentProject: "Net-Zero Courtyard Villa, Whitefield",
    bio: "Pioneering daylight harvesting and zero-loss spatial circulation for luxury residential developments.",
    contactEmail: "aarav.deshmukh@sthavya.example",
    contactPhone: "+91 80 4961 8202",
    availableSlots: [
      { date: new Date(Date.now() + 86400000), time: "03:00 PM", isBooked: false },
      { date: new Date(Date.now() + 172800000), time: "01:00 PM", isBooked: false },
    ],
  },
];

const SEED_PLANS = [
  {
    planId: "plan-150-3bhk-g1-a",
    userId: "seed-master-architect",
    title: "The Courtyard Haven 3BHK (G+1)",
    tagline: "Central Open-Air Sky Courtyard with Dual-Aspect Master Suite",
    isPublic: true,
    inputs: {
      width: "30",
      depth: "45",
      budget: "₹45 - 55 Lakhs",
      budgetLakhs: 48,
      floors: "2 Floors (G+1)",
      familySize: "4-5 Members",
      style: "Modern",
      region: "Bangalore (High Cost)",
      facing: "North",
      parking: "1 Car + 2 Bikes",
      bhk: "3 BHK",
    },
    totalSqFt: 1850,
    rooms: [
      {
        id: "r1",
        label: "Formal Foyer & Living Pavilion",
        dimensions: "16'0\" × 14'6\"",
        sqFt: 232,
        x: 20,
        y: 20,
        w: 220,
        h: 150,
        color: "#F5F2EB",
        recommendedTrade: "Master Modular Carpenter",
        lightRating: "High",
        type: "living",
      },
      {
        id: "r2",
        label: "Central Sunken Green Courtyard",
        dimensions: "10'0\" × 10'0\"",
        sqFt: 100,
        x: 250,
        y: 20,
        w: 120,
        h: 120,
        color: "#E8F5E9",
        recommendedTrade: "Turnkey Civil Contractor",
        lightRating: "High",
        type: "courtyard",
      },
      {
        id: "r3",
        label: "Modular Island Kitchen & Dining",
        dimensions: "18'0\" × 12'0\"",
        sqFt: 216,
        x: 250,
        y: 150,
        w: 200,
        h: 140,
        color: "#FEF3C7",
        recommendedTrade: "Master Modular Carpenter",
        lightRating: "Medium",
        type: "kitchen",
      },
      {
        id: "r4",
        label: "Ground Floor Guest Bedroom",
        dimensions: "12'0\" × 12'0\"",
        sqFt: 144,
        x: 20,
        y: 180,
        w: 160,
        h: 130,
        color: "#EFF6FF",
        recommendedTrade: "Master Modular Carpenter",
        lightRating: "Medium",
        type: "bedroom",
      },
    ],
    auditResult: {
      overallScore: 96,
      circulationRating: "Optimal",
      structuralInsights: [
        "Central sunken courtyard establishes a natural thermal chimney, reducing AC demand by up to 34%.",
        "Linear plumbing corridor groups kitchen and ground bath along a single accessible duct.",
      ],
      costOptimizationTips: [
        "Prefinished pocket slider doors reclaim 42 sq ft of swing clearance across bedrooms.",
        "Modular lintel sizing reduces custom steel fabrication costs by 14%.",
      ],
      recommendedTrades: [
        { trade: "Master Modular Carpenter", reason: "For flush architectural pocket cabinetry" },
        { trade: "Turnkey Civil Contractor", reason: "For structural courtyard perimeter footing" },
      ],
      vastuNotes: "North-facing entry aligns with classical prosperity axis; kitchen in Southeast zone.",
    },
    status: "finalized",
  },
  {
    planId: "plan-200-4bhk-g2-b",
    userId: "seed-master-architect",
    title: "Vedic Light Villa 4BHK (G+2)",
    tagline: "Vastu-Engineered Triplex with Private Terrace Plunge Pool",
    isPublic: true,
    inputs: {
      width: "36",
      depth: "50",
      budget: "₹75 - 85 Lakhs",
      budgetLakhs: 78,
      floors: "3 Floors (G+2)",
      familySize: "5-6 Members",
      style: "Luxury",
      region: "Bangalore (High Cost)",
      facing: "East",
      parking: "2 Cars + Bikes",
      bhk: "4 BHK",
    },
    totalSqFt: 2900,
    rooms: [
      {
        id: "r1",
        label: "Double-Height Grand Salon",
        dimensions: "22'0\" × 16'0\"",
        sqFt: 352,
        x: 20,
        y: 20,
        w: 240,
        h: 160,
        color: "#FAF8F5",
        recommendedTrade: "Master Modular Carpenter",
        lightRating: "High",
        type: "living",
      },
      {
        id: "r2",
        label: "Gourmet Wet & Dry Kitchen",
        dimensions: "16'0\" × 12'0\"",
        sqFt: 192,
        x: 270,
        y: 20,
        w: 180,
        h: 130,
        color: "#FEF3C7",
        recommendedTrade: "Turnkey Civil Contractor",
        lightRating: "Medium",
        type: "kitchen",
      },
      {
        id: "r3",
        label: "Primary Presidential Suite",
        dimensions: "20'0\" × 15'0\"",
        sqFt: 300,
        x: 20,
        y: 190,
        w: 220,
        h: 150,
        color: "#EFF6FF",
        recommendedTrade: "Master Modular Carpenter",
        lightRating: "High",
        type: "master_bed",
      },
    ],
    auditResult: {
      overallScore: 94,
      circulationRating: "Optimal",
      structuralInsights: [
        "Double-height void aligns with dominant prevailing cross-winds for passive cross-ventilation.",
      ],
      costOptimizationTips: [
        "Drywall acoustic framing saves 18 days of masonry cure time on upper floors.",
      ],
      recommendedTrades: [
        { trade: "Turnkey Civil Contractor", reason: "For double-height reinforced cantilever beams" },
        { trade: "Master Sanitary Plumber", reason: "For multizone pressure boosted sanitary lines" },
      ],
      vastuNotes: "East-facing grand entrance brings morning solar energy throughout the living area.",
    },
    status: "finalized",
  },
];

export const seedDatabase = async () => {
  console.log("🌱 Seeding STHAVYA Pure MERN Database...");

  const conn = await connectDB();
  if (!conn) {
    console.error("! MongoDB connection unavailable. Please ensure MongoDB is running or set MONGO_URI in server/.env.");
    process.exit(1);
  }

  try {
    // 1. Seed Users (with hashed passwords via pre-save hook)
    console.log("Seeding Users...");
    for (const u of SEED_USERS) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create(u);
      }
    }
    console.log(`✓ Users seeded (${SEED_USERS.length} accounts ready).`);

    // 2. Seed Workers
    console.log("Seeding Verified Workforce...");
    await Worker.deleteMany({});
    await Worker.insertMany(DEFAULT_WORKERS);
    console.log(`✓ Seeded ${DEFAULT_WORKERS.length} verified trade specialists.`);

    // 3. Seed Architects
    console.log("Seeding Certified Architects...");
    await Architect.deleteMany({});
    await Architect.insertMany(SEED_ARCHITECTS);
    console.log(`✓ Seeded ${SEED_ARCHITECTS.length} certified spatial architects.`);

    // 4. Seed House Plans
    console.log("Seeding Architectural House Plans...");
    for (const plan of SEED_PLANS) {
      const existing = await HousePlan.findOne({ planId: plan.planId });
      if (!existing) {
        await HousePlan.create(plan);
      }
    }
    console.log(`✓ Seeded ${SEED_PLANS.length} signature house plans.`);

    // 5. Seed Sample Booking
    console.log("Seeding Sample Consultations & Bookings...");
    const sampleBooking = await Booking.findOne({ bookingRef: "STHAVYA-IN-700101" });
    if (!sampleBooking) {
      await Booking.create({
        bookingRef: "STHAVYA-IN-700101",
        userId: "seed-client-1",
        clientName: "Deepika Reddy",
        clientPhone: "+91 98765 43210",
        clientEmail: "deepika.reddy@example.com",
        workerId: "w2",
        workerName: "Ar. Elena Rostova",
        workerRole: "Principal Interior Architect & Spatial Planner",
        workerCategory: "Architect",
        days: 5,
        dayRate: 5500,
        totalCost: 27500,
        scopeContext: "150 sq yd Plot Architectural Walkthrough & Municipality Submissions",
        status: "Confirmed",
        scheduledDate: new Date(),
        notes: "Detailed floor plan walkthrough scheduled for tomorrow.",
      });
      console.log("✓ Seeded sample consultation booking.");
    }

    console.log("=======================================================");
    console.log("✦ STHAVYA Pure MERN Database Seed Completed Successfully!");
    console.log("=======================================================");
    process.exit(0);
  } catch (error) {
    console.error("! Database seeding failed:", error);
    process.exit(1);
  }
};

// Auto-run if executed directly
if (process.argv[1]?.endsWith("seedData.js")) {
  seedDatabase();
}

export default seedDatabase;
