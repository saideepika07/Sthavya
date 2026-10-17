import mongoose from "mongoose";
import Worker from "../models/Worker.js";

// Canonical in-house workforce roster for database seeding and reference
export const DEFAULT_WORKERS = [
  {
    workerId: "w1",
    name: "Julian Vance",
    category: "Carpenter",
    role: "Master Architectural Joiner & Modular Cabinetmaker",
    experience: 14,
    rating: 4.98,
    reviewsCount: 142,
    dayRate: 3200,
    location: "Bangalore & Hyderabad",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1547609434-b732edfee020?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Murphy Bed Fabrication", "Fluted Oak Paneling", "Concealed Hardware", "Pocket Pantries"],
    recentProject: "Bespoke Walnut Joinery, Indiranagar Residence",
    bio: "Specializing in ultra-compact modular furniture systems and zero-clearance hidden cabinetry.",
  },
  {
    workerId: "w2",
    name: "Elena Rostova",
    category: "Architect",
    role: "Principal Interior Architect & Spatial Planner",
    experience: 12,
    rating: 4.96,
    reviewsCount: 98,
    dayRate: 5500,
    location: "Mumbai & NCR",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Constraint Solving", "Vastu & Code Norms", "Structural Adjacencies", "CAD Feasibility"],
    recentProject: "Duplex Space Expansion & Lightwell, Bandra West",
    bio: "Certified interior architect focused on maximizing usable volume and daylight in compact urban homes.",
  },
  {
    workerId: "w3",
    name: "Marcus Sterling",
    category: "Contractor",
    role: "Turnkey Civil Contractor & Construction Lead",
    experience: 18,
    rating: 4.94,
    reviewsCount: 215,
    dayRate: 4500,
    location: "Bangalore & Chennai",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Drywall Partitions", "Load-Bearing Wall Openings", "On-Time Guarantee", "Site Logistics"],
    recentProject: "Complete 3-Floor Villa Renovation, Whitefield",
    bio: "Oversees turnkey execution from civil masonry to final finishes, guaranteeing strict timeline adherence.",
  },
  {
    workerId: "w4",
    name: "Devon Chen",
    category: "Electrician",
    role: "High-Voltage Lighting & Smart Automation Lead",
    experience: 9,
    rating: 4.93,
    reviewsCount: 104,
    dayRate: 2800,
    location: "Bangalore & Pune",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Concealed Linear LED", "Smart DALI Dimming", "Panel Relocation", "Surge Protection"],
    recentProject: "Smart Architectural Cove Lighting, Koramangala",
    bio: "Expert in atmospheric ambient lighting, low-voltage channel recessed LED runs, and home automation.",
  },
  {
    workerId: "w5",
    name: "Siddharth Rao",
    category: "Plumber",
    role: "Master Sanitary & Pressure Drainage Specialist",
    experience: 16,
    rating: 4.95,
    reviewsCount: 168,
    dayRate: 2600,
    location: "Bangalore & Hyderabad",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Wet Wall Relocation", "Concealed Flush Tanks", "PEX Manifold Systems", "Leak Acoustic Testing"],
    recentProject: "Compact Dual Bathroom Consolidation, HSR Layout",
    bio: "Ensures flawless plumbing infrastructure with zero-leak acoustic insulation and concealed wall carriers.",
  },
  {
    workerId: "w6",
    name: "Priya Nair",
    category: "Painter",
    role: "Architectural Lime Plaster & Microcement Artisan",
    experience: 11,
    rating: 4.97,
    reviewsCount: 119,
    dayRate: 3100,
    location: "Mumbai & Bangalore",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Venetian Stucco", "Seamless Microcement", "Zero-VOC Mineral Washes", "Acoustic Suede Finishes"],
    recentProject: "Japandi Microcement Flooring & Wall Coating, Jayanagar",
    bio: "Master artisan creating seamless mineral textures, microcement continuous flooring, and Venetian plaster.",
  },
  {
    workerId: "w7",
    name: "Karan Mehta",
    category: "Ceiling",
    role: "Acoustic Gypsum & Zero-Clearance Ceiling Engineer",
    experience: 13,
    rating: 4.91,
    reviewsCount: 88,
    dayRate: 2900,
    location: "Delhi NCR & Bangalore",
    city: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&auto=format",
    verified: true,
    specialties: ["Perimeter Light Troughs", "Acoustic Decoupling", "Drop Level Reduction", "Magnetic Track Channels"],
    recentProject: "Ultrathin False Ceiling with Hidden AC Plenums, Lavelle Rd",
    bio: "Specializing in ultra-thin ceiling drops that maximize vertical headspace while housing magnetic track lights.",
  },
];

/**
 * @desc    Get list of all verified trade specialists
 * @route   GET /api/workers
 * @access  Public
 */
export const getWorkers = async (req, res) => {
  try {
    const { category, location, city, search } = req.query;
    const query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (location || city) {
      const loc = location || city;
      query.$or = [
        { location: { $regex: loc, $options: "i" } },
        { city: { $regex: loc, $options: "i" } },
      ];
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { specialties: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const workers = await Worker.find(query).sort({ rating: -1 });

    res.json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch workforce specialists from database.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get worker by workerId or MongoDB _id
 * @route   GET /api/workers/:id
 * @access  Public
 */
export const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;

    const clauses = [{ workerId: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      clauses.push({ _id: id });
    }

    const worker = await Worker.findOne({ $or: clauses });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Trade specialist not found.",
      });
    }

    res.json({
      success: true,
      worker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default { getWorkers, getWorkerById, DEFAULT_WORKERS };
