// Professional & Specialist Directory Dataset
// Representing all 9 mandatory professional categories with availability slots, consultation fees, and verified credentials

export type ProfessionalCategory =
  | "Architect"
  | "Civil Engineer"
  | "Structural Engineer"
  | "Interior Designer"
  | "3D Designer"
  | "Electrical Engineer"
  | "Plumbing Professional"
  | "Contractor"
  | "Construction Team";

export interface ProfessionalProfile {
  id: string;
  name: string;
  category: ProfessionalCategory;
  role: string;
  experience: number;
  location: string;
  avatar: string;
  services: string[];
  workingDays: string;
  consultationFee: number;
  dayRate: number;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  bio: string;
  email: string;
  phoneSafe: string;
  completedProjects: number;
  availableSlots: {
    date: string;
    slots: string[];
  }[];
}

export const PROFESSIONALS_DIRECTORY: ProfessionalProfile[] = [
  {
    id: "pro-arch-1",
    name: "Ar. Elena Rostova",
    category: "Architect",
    role: "Senior Council-Registered Residential Architect",
    experience: 14,
    location: "Bangalore & Hyderabad",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&auto=format",
    services: [
      "2D Master Blueprint & Municipality Approvals",
      "Vastu Compliance Space Distribution",
      "FAR & Setback Optimization",
      "Full Site Feasibility Audits",
    ],
    workingDays: "Mon - Sat (9:00 AM - 6:30 PM)",
    consultationFee: 2500,
    dayRate: 5500,
    rating: 4.98,
    reviewsCount: 164,
    verified: true,
    bio: "Specializing in high-density residential layouts, passive natural ventilation, and zero-wasted circulation spaces.",
    email: "elena.rostova@sthavya.example",
    phoneSafe: "+91 98*** **210",
    completedProjects: 148,
    availableSlots: [
      { date: "Tomorrow", slots: ["10:00 AM", "02:00 PM", "04:30 PM"] },
      { date: "Day After", slots: ["11:00 AM", "03:30 PM", "05:00 PM"] },
      { date: "In 3 Days", slots: ["09:30 AM", "01:00 PM", "04:00 PM"] },
    ],
  },
  {
    id: "pro-civil-1",
    name: "Er. Rajeshwar Rao",
    category: "Civil Engineer",
    role: "Principal Site Civil & Material Engineer",
    experience: 18,
    location: "Hyderabad & Amaravati",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format",
    services: [
      "Foundation Soil Bearing Load Audit",
      "RCC Slab & Column Framing Analysis",
      "On-Site Material Quality Grading",
      "BOQ Cost & Quantity Estimation",
    ],
    workingDays: "Mon - Sat (8:30 AM - 6:00 PM)",
    consultationFee: 2000,
    dayRate: 4800,
    rating: 4.95,
    reviewsCount: 182,
    verified: true,
    bio: "Over 18 years overseeing high-durability residential construction, earthquake-resistant framing, and site logistics.",
    email: "rajeshwar.rao@sthavya.example",
    phoneSafe: "+91 94*** **890",
    completedProjects: 215,
    availableSlots: [
      { date: "Tomorrow", slots: ["09:00 AM", "11:30 AM", "03:00 PM"] },
      { date: "Day After", slots: ["10:00 AM", "01:30 PM", "04:30 PM"] },
    ],
  },
  {
    id: "pro-struct-1",
    name: "Dr. Alistair Sterling",
    category: "Structural Engineer",
    role: "Chief Structural Consultant & Seismic Specialist",
    experience: 20,
    location: "Mumbai & NCR",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&auto=format",
    services: [
      "Seismic Zone IV & V Resistance Calculations",
      "Cantilever Balcony & Long-Span Slabs",
      "Deep Piling & Raft Foundation Design",
      "Structural Safety Certification",
    ],
    workingDays: "Tue - Sun (10:00 AM - 7:00 PM)",
    consultationFee: 3200,
    dayRate: 6500,
    rating: 4.99,
    reviewsCount: 95,
    verified: true,
    bio: "Ph.D. in Structural Dynamics; authority in lightweight post-tensioned slabs and high-load structural steel framing.",
    email: "alistair.sterling@sthavya.example",
    phoneSafe: "+91 97*** **334",
    completedProjects: 112,
    availableSlots: [
      { date: "Tomorrow", slots: ["11:30 AM", "02:30 PM", "05:00 PM"] },
      { date: "Day After", slots: ["10:00 AM", "03:00 PM"] },
    ],
  },
  {
    id: "pro-interior-1",
    name: "Maya Shenoy",
    category: "Interior Designer",
    role: "Bespoke Residential & Space-Saving Interior Lead",
    experience: 11,
    location: "Bangalore & Pune",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&auto=format",
    services: [
      "Modular Kitchen & Concealed Pantry Layouts",
      "Pocket Wardrobes & Multi-Functional Joinery",
      "Acoustic Paneling & False Ceiling Profiles",
      "Material Swatch Palettes & Moodboards",
    ],
    workingDays: "Mon - Fri (10:00 AM - 6:00 PM)",
    consultationFee: 2200,
    dayRate: 4200,
    rating: 4.96,
    reviewsCount: 140,
    verified: true,
    bio: "Focusing on Japandi and warm contemporary aesthetics that turn small square footages into spacious sanctuaries.",
    email: "maya.shenoy@sthavya.example",
    phoneSafe: "+91 99*** **771",
    completedProjects: 124,
    availableSlots: [
      { date: "Tomorrow", slots: ["10:30 AM", "01:30 PM", "04:00 PM"] },
      { date: "Day After", slots: ["11:00 AM", "02:00 PM", "05:30 PM"] },
    ],
  },
  {
    id: "pro-3d-1",
    name: "Devon Chen",
    category: "3D Designer",
    role: "Architectural 3D Visualizer & CAD Modeler",
    experience: 9,
    location: "Virtual / Pan-India",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&auto=format",
    services: [
      "Photorealistic Exterior Elevation Renders",
      "Walkthrough 4K Architectural Animations",
      "Cutaway Isometric Floor Plan 3D Models",
      "Sun-Path & Natural Daylighting Simulations",
    ],
    workingDays: "Mon - Sat (9:00 AM - 7:00 PM)",
    consultationFee: 1800,
    dayRate: 3500,
    rating: 4.97,
    reviewsCount: 115,
    verified: true,
    bio: "Unreal Engine and Blender master crafting hyper-realistic lighting, textures, and interactive virtual floor plans.",
    email: "devon.chen@sthavya.example",
    phoneSafe: "+91 88*** **422",
    completedProjects: 230,
    availableSlots: [
      { date: "Tomorrow", slots: ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM"] },
      { date: "Day After", slots: ["10:00 AM", "02:00 PM", "04:30 PM"] },
    ],
  },
  {
    id: "pro-elec-1",
    name: "Suresh Nambiar",
    category: "Electrical Engineer",
    role: "Smart Home Automation & MEP Electrical Lead",
    experience: 15,
    location: "Chennai & Bangalore",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&auto=format",
    services: [
      "Whole-Home Conduit Routing & Load Balancing",
      "Architectural Magnetic Track Profile Layouts",
      "Solar Rooftop & Inverter Backup Sizing",
      "Smart Scene Lighting Automation Hubs",
    ],
    workingDays: "Mon - Sat (8:00 AM - 5:30 PM)",
    consultationFee: 1500,
    dayRate: 3200,
    rating: 4.94,
    reviewsCount: 129,
    verified: true,
    bio: "Eliminates tripping hazards and wiring mess with concealed architectural conduit runs and smart scene controls.",
    email: "suresh.nambiar@sthavya.example",
    phoneSafe: "+91 93*** **115",
    completedProjects: 175,
    availableSlots: [
      { date: "Tomorrow", slots: ["08:30 AM", "11:00 AM", "02:30 PM"] },
      { date: "Day After", slots: ["09:00 AM", "01:00 PM", "04:00 PM"] },
    ],
  },
  {
    id: "pro-plumb-1",
    name: "Farhan Qureshi",
    category: "Plumbing Professional",
    role: "Master Sanitary & Rainwater Harvesting Specialist",
    experience: 16,
    location: "NCR & Jaipur",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&auto=format",
    services: [
      "Zero-Leak Concealed Plumbing Stack Design",
      "Water Pressure Boosting & Pump Calculations",
      "Rainwater Recharge & Underground Sump Planning",
      "Greywater Recycling & Sewage Invert Levels",
    ],
    workingDays: "Mon - Sat (8:00 AM - 6:00 PM)",
    consultationFee: 1400,
    dayRate: 2800,
    rating: 4.93,
    reviewsCount: 148,
    verified: true,
    bio: "Specializing in acoustic-damped drainage pipes and high-pressure luxury shower networks that never lose pressure.",
    email: "farhan.qureshi@sthavya.example",
    phoneSafe: "+91 98*** **663",
    completedProjects: 190,
    availableSlots: [
      { date: "Tomorrow", slots: ["09:30 AM", "12:30 PM", "03:30 PM"] },
      { date: "Day After", slots: ["10:30 AM", "02:00 PM"] },
    ],
  },
  {
    id: "pro-contract-1",
    name: "Marcus Sterling",
    category: "Contractor",
    role: "Turnkey Residential General Contractor",
    experience: 19,
    location: "Bangalore & Mysore",
    avatar: "https://images.unsplash.com/photo-1547609434-b732edfee020?w=300&h=300&fit=crop&auto=format",
    services: [
      "Turnkey Brick-to-Key Construction Management",
      "Strict Milestone-Based Timeline Adherence",
      "Pre-Vetted Masonry & Joinery Supervision",
      "Government Safety & Labor Compliance",
    ],
    workingDays: "Mon - Sat (8:00 AM - 7:00 PM)",
    consultationFee: 2500,
    dayRate: 5000,
    rating: 4.96,
    reviewsCount: 210,
    verified: true,
    bio: "Guaranteed on-time delivery with zero cost overruns. Has managed over 200 villa and bungalow turnkeys.",
    email: "marcus.sterling@sthavya.example",
    phoneSafe: "+91 91*** **902",
    completedProjects: 205,
    availableSlots: [
      { date: "Tomorrow", slots: ["10:00 AM", "02:00 PM", "05:00 PM"] },
      { date: "Day After", slots: ["09:00 AM", "01:30 PM", "04:30 PM"] },
    ],
  },
  {
    id: "pro-team-1",
    name: "STHAVYA In-House Master Build Crew",
    category: "Construction Team",
    role: "Integrated Multi-Trade Construction & Joinery Squad",
    experience: 15,
    location: "Pan-Metros (Bangalore, Mumbai, Hyd, NCR)",
    avatar: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=300&fit=crop&auto=format",
    services: [
      "Full Civil, Brickwork & Plastering Workforce",
      "Factory Modular Joinery & Furniture Installers",
      "Waterproofing & Terrace Tile Crews",
      "Dedicated Full-Time Site Supervisor",
    ],
    workingDays: "Mon - Sun (Site Dependent)",
    consultationFee: 3000,
    dayRate: 9500,
    rating: 4.99,
    reviewsCount: 312,
    verified: true,
    bio: "Cohesive team of 18 master artisans working synchronously under a single superintendent for zero delays.",
    email: "crews@sthavya.example",
    phoneSafe: "+91 80*** **200",
    completedProjects: 310,
    availableSlots: [
      { date: "Tomorrow", slots: ["11:00 AM", "03:00 PM"] },
      { date: "Day After", slots: ["10:00 AM", "02:30 PM", "05:00 PM"] },
    ],
  },
];
