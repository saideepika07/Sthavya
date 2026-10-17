import { useState, useEffect, useId } from "react";
import { bookingApi } from "../services/api";
import { getCurrentUser, type SthavyaUser } from "../services/auth";

interface ConsultationPageProps {
  currentUser?: SthavyaUser | null;
  onOpenLogin: () => void;
  onBackToHome: () => void;
  onOpenAiPlanner?: (budgetLakhs: number) => void;
  initialWorkerId?: string;
  initialScope?: string;
}

interface WorkerInfo {
  id: string;
  name: string;
  role: string;
  category: string;
  dayRate: number;
  avatar: string;
  rating: number;
}

const MASTER_SPECIALISTS: WorkerInfo[] = [
  {
    id: "w2",
    name: "Elena Rostova",
    role: "Principal Interior Architect & Spatial Planner",
    category: "Architect",
    dayRate: 5500,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format",
    rating: 4.96,
  },
  {
    id: "w1",
    name: "Julian Vance",
    role: "Master Architectural Joiner & Modular Cabinetmaker",
    category: "Carpenter",
    dayRate: 3200,
    avatar: "https://images.unsplash.com/photo-1547609434-b732edfee020?w=200&h=200&fit=crop&auto=format",
    rating: 4.98,
  },
  {
    id: "w3",
    name: "Marcus Sterling",
    role: "Turnkey Civil Contractor & Construction Lead",
    category: "Contractor",
    dayRate: 4500,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
    rating: 4.94,
  },
  {
    id: "w4",
    name: "Devon Chen",
    role: "Smart Home & Architectural Lighting Specialist",
    category: "Electrician",
    dayRate: 2800,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format",
    rating: 4.99,
  },
];

const BUDGET_PRESETS = [
  { label: "Compact & Smart", value: 450000, display: "₹4.5 Lakhs", tag: "1-2 BHK Essentials" },
  { label: "Modern Standard", value: 1000000, display: "₹10 Lakhs", tag: "Popular for 2-3 BHK" },
  { label: "Premium Luxury", value: 2500000, display: "₹25 Lakhs", tag: "3-4 BHK Complete Finish" },
  { label: "Ultra Bespoke Estate", value: 6500000, display: "₹65 Lakhs", tag: "Duplex / Luxury Villa" },
];

const DURATION_PRESETS = [
  { days: 3, title: "3 Days Sprint", desc: "AI Concept, 3D CAD & Itemized BOQ", badge: "Express" },
  { days: 10, title: "10 Days Modular", desc: "Modular Kitchen & Wardrobe Assembly", badge: "Fast-Track" },
  { days: 25, title: "25 Days Turnkey", desc: "Complete 2-3 BHK Interior Handover", badge: "Most Popular" },
  { days: 60, title: "60 Days Renovation", desc: "Full Architectural & Civil Transformation", badge: "Deep Build" },
];

export default function ConsultationPage({
  currentUser,
  onOpenLogin,
  onBackToHome,
  onOpenAiPlanner,
  initialWorkerId,
  initialScope,
}: ConsultationPageProps) {
  // Budget State in Rupees
  const [budget, setBudget] = useState<number>(1200000); // 12 Lakhs default
  // Days State
  const [days, setDays] = useState<number>(15);

  // Scope & Property
  const [projectType, setProjectType] = useState<string>("Full Home Turnkey Interior");
  const [bhk, setBhk] = useState<string>("3 BHK");
  const [sqFt, setSqFt] = useState<number>(1450);
  const [designStyle, setDesignStyle] = useState<string>("Japandi Warmth");
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(
    initialWorkerId || MASTER_SPECIALISTS[0].id
  );

  // Consultation Session details
  const [consultMode, setConsultMode] = useState<"studio" | "site" | "virtual">("site");
  const [meetingDate, setMeetingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [meetingSlot, setMeetingSlot] = useState<string>("Morning 10:30 AM");

  // Client Details Form (pre-filled from logged in user)
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [city, setCity] = useState<string>("Bangalore");
  const [notes, setNotes] = useState<string>(initialScope || "");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingRef: string;
    date: string;
    slot: string;
    totalLabor: number;
    allocatedBudget: number;
    days: number;
    savedOnServer: boolean;
  } | null>(null);

  const budgetInputId = useId();
  const daysInputId = useId();
  const nameInputId = useId();
  const phoneInputId = useId();
  const emailInputId = useId();

  // Populate client details from auth state or storage
  useEffect(() => {
    const active = currentUser || getCurrentUser();
    if (active) {
      if (active.displayName && !clientName) setClientName(active.displayName);
      if (active.email && !clientEmail) setClientEmail(active.email);
      if (active.phoneNumber && !clientPhone) setClientPhone(active.phoneNumber);
    }
    const savedContact = window.localStorage.getItem("STHAVYA_USER_CONTACT");
    if (savedContact && !clientPhone) {
      setClientPhone(savedContact);
    }
  }, [currentUser]);

  // Derived calculations
  const budgetInLakhs = (budget / 100000).toFixed(1);
  const selectedSpecialist =
    MASTER_SPECIALISTS.find((s) => s.id === selectedSpecialistId) || MASTER_SPECIALISTS[0];
  const totalLaborCost = selectedSpecialist.dayRate * days;

  // Budget Breakdown percentages
  const materialsShare = Math.round(budget * 0.50);
  const laborShare = Math.round(budget * 0.25);
  const designShare = Math.round(budget * 0.12);
  const supervisionShare = Math.round(budget * 0.08);
  const contingencyShare = Math.round(budget * 0.05);

  // Estimated completion date
  const completionDateString = (() => {
    const date = new Date(meetingDate || Date.now());
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  // Milestone phases calculated dynamically based on days
  const milestones = [
    {
      phase: "Phase 1: Space Discovery & LiDAR Scan",
      time: `Day 1 - ${Math.max(1, Math.round(days * 0.15))}`,
      desc: "Physical on-site audit, 3D laser room scan, structural & MEP validation.",
      tag: "Site Audit",
    },
    {
      phase: "Phase 2: AI 3D CAD & Material Board Sign-Off",
      time: `Day ${Math.max(2, Math.round(days * 0.15) + 1)} - ${Math.max(2, Math.round(days * 0.35))}`,
      desc: "Vastu-compliant 2D architectural blueprint, photorealistic 3D renders, and finishes lock.",
      tag: "Design Freeze",
    },
    {
      phase: "Phase 3: Modular Millwork & Master Assembly",
      time: `Day ${Math.max(3, Math.round(days * 0.35) + 1)} - ${Math.max(3, Math.round(days * 0.85))}`,
      desc: `In-house factory joinery fabrication by ${selectedSpecialist.name}, false ceiling & electrical fit-outs.`,
      tag: "Execution",
    },
    {
      phase: "Phase 4: Lighting Tuning, Quality Audit & Handover",
      time: `Day ${Math.max(4, Math.round(days * 0.85) + 1)} - Day ${days}`,
      desc: "Architectural lighting calibration, 47-point quality inspection, and spotless client handover.",
      tag: "Final Handover",
    },
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      alert("Please ensure your name, contact phone number, and email address are provided.");
      return;
    }

    setIsSubmitting(true);
    let bookingRef = `STHAVYA-CONSULT-${Math.floor(100000 + Math.random() * 900000)}`;
    let savedOnServer = false;

    try {
      const res = await bookingApi.createBooking({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        workerId: selectedSpecialist.id,
        workerName: selectedSpecialist.name,
        workerRole: selectedSpecialist.role,
        workerCategory: selectedSpecialist.category,
        days,
        dayRate: selectedSpecialist.dayRate,
        scopeContext: `${projectType} (${bhk}, ${sqFt} sq.ft, Style: ${designStyle}). Budget: ₹${budgetInLakhs}L. Mode: ${consultMode}. Slot: ${meetingDate} ${meetingSlot}`,
        userId: currentUser?.uid,
      });
      if (res?.success && res.booking?.bookingRef) {
        // Use the reference issued by the server so the customer can quote it later.
        bookingRef = res.booking.bookingRef;
        savedOnServer = true;
      }
    } catch {
      // Backend unreachable - handled below
    }

    if (!savedOnServer) {
      alert(
        "We couldn't reach the booking server, so this request is saved on this device only and has NOT been sent to the specialist. Please try again in a moment."
      );
    }

    // Persist consultation details
    const bookingRecord = {
      bookingRef,
      date: meetingDate,
      slot: meetingSlot,
      totalLabor: totalLaborCost,
      allocatedBudget: budget,
      days,
      savedOnServer,
    };

    try {
      const existing = JSON.parse(window.localStorage.getItem("STHAVYA_CONSULTATION_BOOKINGS") || "[]");
      existing.unshift(bookingRecord);
      window.localStorage.setItem("STHAVYA_CONSULTATION_BOOKINGS", JSON.stringify(existing));
    } catch {}

    setConfirmedBooking(bookingRecord);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] selection:bg-[#B88555]/20 selection:text-[#181614]">
      {/* Top Header */}
      <header className="w-full px-6 py-4 border-b border-[rgba(28,24,20,0.08)] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 group text-left"
            >
              <span className="w-8 h-8 rounded-xl bg-[#181614] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-[#B88555] transition-colors">
                ✦
              </span>
              <div>
                <span className="font-display font-extrabold text-base tracking-tight text-[#181614] block leading-none">
                  STHAVYA
                </span>
                <span className="text-[9px] tracking-widest uppercase font-mono text-[#8E867B] font-semibold">
                  Consultation Studio
                </span>
              </div>
            </button>
            <span className="hidden md:inline-block text-xs text-[#8E867B] font-mono">
              / Budget &amp; Timeline Configurator
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* User pill or Login button */}
            {currentUser || clientName ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFECE6] border border-[rgba(28,24,20,0.1)] text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#181614] max-w-[120px] truncate">
                  {clientName || currentUser?.displayName || "Client"}
                </span>
                <span className="hidden sm:inline text-[#8E867B] text-[11px] font-mono">
                  ({clientPhone || "Verified"})
                </span>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="text-xs font-semibold text-[#575149] hover:text-[#181614] px-3.5 py-1.5 rounded-full border border-[rgba(28,24,20,0.15)] hover:border-[#B88555] transition-colors"
              >
                Sign In with Contact
              </button>
            )}

            <button
              onClick={onBackToHome}
              className="text-xs font-semibold text-[#575149] hover:text-[#181614] px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14 space-y-12">
        {/* Confirmed Booking Modal / Hero Card */}
        {confirmedBooking ? (
          <div className="bg-[#FAF8F5] border border-emerald-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(28,24,20,0.08)]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    Consultation Locked
                  </span>
                  <h1 className="font-display font-bold text-2xl md:text-3xl text-[#181614] mt-1">
                    Your Architectural Session is Scheduled!
                  </h1>
                </div>
              </div>
              <div className="p-3 bg-[#EFECE6] rounded-2xl text-right">
                <span className="text-[10px] font-mono uppercase text-[#8E867B] block">Reference Code</span>
                <span className="font-mono font-bold text-sm text-[#181614]">{confirmedBooking.bookingRef}</span>
                {!confirmedBooking.savedOnServer && (
                  <span className="text-[10px] font-semibold text-amber-800 block mt-1">Saved on this device only</span>
                )}
              </div>
            </div>

            {/* Breakdown Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)]">
                <span className="text-[11px] text-[#8E867B] uppercase font-mono block mb-1">Allocated Budget</span>
                <span className="font-display font-bold text-xl text-[#B88555]">
                  ₹{(confirmedBooking.allocatedBudget / 100000).toFixed(1)} Lakhs
                </span>
                <p className="text-[11px] text-[#575149] mt-0.5">₹{confirmedBooking.allocatedBudget.toLocaleString("en-IN")}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)]">
                <span className="text-[11px] text-[#8E867B] uppercase font-mono block mb-1">Execution Timeline</span>
                <span className="font-display font-bold text-xl text-[#181614]">
                  {confirmedBooking.days} Working Days
                </span>
                <p className="text-[11px] text-[#575149] mt-0.5">Target Completion: {completionDateString}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)]">
                <span className="text-[11px] text-[#8E867B] uppercase font-mono block mb-1">Designated Lead</span>
                <span className="font-display font-bold text-base text-[#181614] truncate block">
                  {selectedSpecialist.name}
                </span>
                <p className="text-[11px] text-[#575149] mt-0.5">{selectedSpecialist.role.split("&")[0]}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)]">
                <span className="text-[11px] text-[#8E867B] uppercase font-mono block mb-1">Meeting Time</span>
                <span className="font-display font-bold text-base text-[#181614] block">
                  {confirmedBooking.date}
                </span>
                <p className="text-[11px] text-[#575149] mt-0.5">{confirmedBooking.slot} ({consultMode.toUpperCase()})</p>
              </div>
            </div>

            {/* Notification Confirmation Text */}
            <div className="p-5 bg-[#EFECE6]/80 rounded-2xl text-xs text-[#575149] flex items-start gap-3">
              <span className="text-lg">📱</span>
              <div>
                <p className="font-semibold text-[#181614]">
                  SMS &amp; WhatsApp Confirmation Dispatched to <strong>{clientPhone}</strong>
                </p>
                <p className="mt-0.5 text-[11px]">
                  Our client relationship executive and <strong>{selectedSpecialist.name}</strong> will reach out via WhatsApp with the calendar invite and CAD preparation checklist.
                </p>
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  if (onOpenAiPlanner) {
                    onOpenAiPlanner(budget / 100000);
                  } else {
                    onBackToHome();
                  }
                }}
                className="py-3.5 px-6 rounded-2xl bg-[#B88555] hover:bg-[#A07144] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Launch 2D Floor Planner with this ₹{budgetInLakhs}L Budget</span>
                <span>↗</span>
              </button>

              <button
                onClick={() => window.print()}
                className="py-3.5 px-6 rounded-2xl bg-white hover:bg-[#EFECE6] border border-[rgba(28,24,20,0.15)] text-[#181614] font-semibold text-xs transition-colors"
              >
                🖨 Download / Print Consultation Brief
              </button>

              <button
                onClick={() => setConfirmedBooking(null)}
                className="py-3.5 px-4 text-xs font-semibold text-[#575149] hover:text-[#181614]"
              >
                Adjust Parameters &amp; Rebook
              </button>
            </div>
          </div>
        ) : null}

        {/* Page Hero Header */}
        {!confirmedBooking && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE6] border border-[rgba(28,24,20,0.1)] text-xs font-mono text-[#B88555] font-semibold tracking-wide">
              <span>✦</span>
              <span>BUDGET &amp; TIMELINE CONSULTATION</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#181614] max-w-3xl">
              Design &amp; Execution Consultation Tailored to Your Budget &amp; Timeline.
            </h1>

            <p className="text-sm sm:text-base text-[#575149] max-w-2xl leading-relaxed">
              Adjust your targeted budget and preferred number of working days below. Our real-time algorithmic planner breaks down material vs. labor expenses, allocates verified in-house master craftsmen, and locks in your exact schedule.
            </p>
          </div>
        )}

        {/* Main Interactive Matrix */}
        {!confirmedBooking && (
          <form onSubmit={handleBookingSubmit} className="space-y-12">
            {/* ── SECTION 1: THE BUDGET CONTROLS ── */}
            <div className="bg-[#FAF8F5] border border-[rgba(28,24,20,0.1)] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(28,24,20,0.06)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#B88555] text-white flex items-center justify-center text-xs font-bold font-mono">
                      1
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#181614]">
                      Your Allocated Budget
                    </h2>
                  </div>
                  <p className="text-xs text-[#575149] mt-0.5">
                    Drag the slider or choose a preset tier. Transparent live breakdown included.
                  </p>
                </div>

                {/* Big Currency Display */}
                <div className="text-right bg-white px-5 py-3 rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-2xs">
                  <span className="text-[10px] font-mono text-[#8E867B] uppercase block">Selected Budget</span>
                  <span className="font-display font-bold text-2xl sm:text-3xl text-[#B88555]">
                    ₹{budgetInLakhs} Lakhs
                  </span>
                  <span className="text-[11px] font-mono text-[#575149] block">
                    (₹{budget.toLocaleString("en-IN")})
                  </span>
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono text-[#8E867B]">
                  <span>₹2.5 Lakhs (Compact)</span>
                  <span>₹50 Lakhs (Luxury)</span>
                  <span>₹1.5 Crores+ (Estate)</span>
                </div>
                <input
                  id={budgetInputId}
                  type="range"
                  min={250000}
                  max={10000000}
                  step={50000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-3 bg-[#EFECE6] rounded-lg appearance-none cursor-pointer accent-[#B88555]"
                />
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {BUDGET_PRESETS.map((p) => {
                  const isSelected = Math.abs(budget - p.value) < 50000;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setBudget(p.value)}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? "bg-[#28362B] text-white border-[#28362B] shadow-md"
                          : "bg-white text-[#181614] border-[rgba(28,24,20,0.1)] hover:border-[#B88555]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#181614]"}`}>
                          {p.display}
                        </span>
                        {isSelected && <span className="text-[10px] font-mono text-amber-300">Active</span>}
                      </div>
                      <span className={`text-[11px] block mt-0.5 ${isSelected ? "text-white/80" : "text-[#575149]"}`}>
                        {p.label}
                      </span>
                      <span className={`text-[10px] font-mono block mt-1 ${isSelected ? "text-white/60" : "text-[#8E867B]"}`}>
                        {p.tag}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Budget Breakdown Cards */}
              <div className="p-5 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#575149]">
                    Real-Time Financial Allocation Breakdown
                  </h3>
                  <span className="text-[10px] font-mono text-[#8E867B]">100% Transparent • Zero Hidden Costs</span>
                </div>

                {/* Visual Stacked Bar */}
                <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-[#EFECE6]">
                  <div style={{ width: "50%" }} className="bg-[#B88555]" title="Materials (50%)" />
                  <div style={{ width: "25%" }} className="bg-[#28362B]" title="Master Labor (25%)" />
                  <div style={{ width: "12%" }} className="bg-[#575149]" title="AI CAD & 3D (12%)" />
                  <div style={{ width: "8%" }} className="bg-[#8E867B]" title="Supervision (8%)" />
                  <div style={{ width: "5%" }} className="bg-[#C59B67]" title="Contingency (5%)" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[rgba(28,24,20,0.05)]">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#575149] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#B88555]" />
                      Materials (50%)
                    </span>
                    <span className="font-bold font-mono text-sm text-[#181614] block mt-1">
                      ₹{materialsShare.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#8E867B]">Plywood, laminates, stone</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[rgba(28,24,20,0.05)]">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#575149] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#28362B]" />
                      In-House Labor (25%)
                    </span>
                    <span className="font-bold font-mono text-sm text-[#181614] block mt-1">
                      ₹{laborShare.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#8E867B]">Joiners, civil, lighting</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[rgba(28,24,20,0.05)]">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#575149] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#575149]" />
                      AI CAD &amp; 3D (12%)
                    </span>
                    <span className="font-bold font-mono text-sm text-[#181614] block mt-1">
                      ₹{designShare.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#8E867B]">Blueprint drawings &amp; MEP</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[rgba(28,24,20,0.05)]">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#575149] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#8E867B]" />
                      Supervision (8%)
                    </span>
                    <span className="font-bold font-mono text-sm text-[#181614] block mt-1">
                      ₹{supervisionShare.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#8E867B]">Lead site engineer</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[rgba(28,24,20,0.05)]">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#575149] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#C59B67]" />
                      Contingency (5%)
                    </span>
                    <span className="font-bold font-mono text-sm text-[#181614] block mt-1">
                      ₹{contingencyShare.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#8E867B]">Safe cushion reserve</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: TIMELINE CONTROLS (HOW MANY DAYS) ── */}
            <div className="bg-[#FAF8F5] border border-[rgba(28,24,20,0.1)] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(28,24,20,0.06)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#28362B] text-white flex items-center justify-center text-xs font-bold font-mono">
                      2
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#181614]">
                      How Many Days (Execution Speed)
                    </h2>
                  </div>
                  <p className="text-xs text-[#575149] mt-0.5">
                    Configure your delivery timeline. The schedule and milestone dates adjust in real-time.
                  </p>
                </div>

                <div className="text-right bg-white px-5 py-3 rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-2xs">
                  <span className="text-[10px] font-mono text-[#8E867B] uppercase block">Selected Duration</span>
                  <span className="font-display font-bold text-2xl sm:text-3xl text-[#28362B]">
                    {days} Days
                  </span>
                  <span className="text-[11px] font-mono text-[#575149] block">
                    Handover by: {completionDateString}
                  </span>
                </div>
              </div>

              {/* Days Range Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono text-[#8E867B]">
                  <span>3 Days (Express Sprint)</span>
                  <span>30 Days (Standard Turnkey)</span>
                  <span>90 Days (Complete Civil &amp; Remodel)</span>
                </div>
                <input
                  id={daysInputId}
                  type="range"
                  min={3}
                  max={90}
                  step={1}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-3 bg-[#EFECE6] rounded-lg appearance-none cursor-pointer accent-[#28362B]"
                />
              </div>

              {/* Days Preset Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {DURATION_PRESETS.map((d) => {
                  const isSelected = days === d.days;
                  return (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setDays(d.days)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? "bg-[#28362B] text-white border-[#28362B] shadow-md"
                          : "bg-white text-[#181614] border-[rgba(28,24,20,0.1)] hover:border-[#28362B]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-base">{d.title}</span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                            isSelected ? "bg-white/20 text-amber-300" : "bg-[#EFECE6] text-[#575149]"
                          }`}
                        >
                          {d.badge}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-snug ${isSelected ? "text-white/80" : "text-[#575149]"}`}>
                        {d.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Adaptive Project Roadmap based on selected Days */}
              <div className="p-5 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#575149]">
                    Adaptive Day-by-Day Milestone Roadmap ({days} Days)
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    Guaranteed Timeline
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {milestones.map((m, idx) => (
                    <div
                      key={m.phase}
                      className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[rgba(28,24,20,0.06)] relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-[#B88555] bg-amber-50 px-1.5 py-0.5 rounded">
                            {m.tag}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#181614]">{m.time}</span>
                        </div>
                        <h4 className="font-display font-bold text-xs text-[#181614] mb-1">
                          {m.phase.split(":")[1] || m.phase}
                        </h4>
                        <p className="text-[11px] text-[#575149] leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[rgba(28,24,20,0.06)] flex items-center justify-between text-[10px] text-[#8E867B]">
                        <span>Milestone 0{idx + 1}</span>
                        <span>{idx === milestones.length - 1 ? "🎉 Handover" : "Next Phase →"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SECTION 3: WORK SCOPE & PROPERTY SPECS ── */}
            <div className="bg-[#FAF8F5] border border-[rgba(28,24,20,0.1)] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[rgba(28,24,20,0.06)]">
                <span className="w-6 h-6 rounded-md bg-[#575149] text-white flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-[#181614]">
                    Work Scope &amp; Space Details
                  </h2>
                  <p className="text-xs text-[#575149]">
                    Select project typology, area size, and aesthetic direction.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Project Category */}
                <div>
                  <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-2">
                    Project Typology
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-3 text-xs font-semibold text-[#181614] focus:outline-none focus:border-[#B88555]"
                  >
                    <option value="Full Home Turnkey Interior">Full Home Turnkey Interior</option>
                    <option value="Modular Kitchen & Living Remodel">Modular Kitchen &amp; Living Remodel</option>
                    <option value="Architectural CAD Blueprint & Civil Planning">Architectural CAD Blueprint &amp; Civil Planning</option>
                    <option value="Luxury Villa & Duplex Construction">Luxury Villa &amp; Duplex Construction</option>
                    <option value="Studio / Acoustic Office Workspace">Studio / Acoustic Office Workspace</option>
                  </select>
                </div>

                {/* BHK Configuration */}
                <div>
                  <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-2">
                    Configuration (BHK)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["1 BHK", "2 BHK", "3 BHK", "4+ BHK"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBhk(b)}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          bhk === b
                            ? "bg-[#181614] text-white border-[#181614]"
                            : "bg-white text-[#575149] border-[rgba(28,24,20,0.15)] hover:border-[#B88555]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area Sq Ft */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#575149] uppercase tracking-wider">
                      Area Size: <span className="font-mono text-[#181614]">{sqFt} Sq. Ft</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#8E867B]">
                      ≈ ₹{Math.round(budget / sqFt)}/sq.ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min={450}
                    max={4500}
                    step={50}
                    value={sqFt}
                    onChange={(e) => setSqFt(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#EFECE6] rounded-lg appearance-none cursor-pointer accent-[#B88555]"
                  />
                </div>
              </div>

              {/* Design Style Selector */}
              <div>
                <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-2.5">
                  Desired Architectural &amp; Interior Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { name: "Japandi Warmth", sub: "Fluted oak & zero clutter" },
                    { name: "Modern Minimalist", sub: "Clean lines & concealed joinery" },
                    { name: "Neo-Classical", sub: "Mouldings & brass detailing" },
                    { name: "Scandinavian", sub: "Airy light & pale ashwood" },
                    { name: "Indian Contemporary", sub: "Teakwood & lime wash texture" },
                  ].map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setDesignStyle(s.name)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        designStyle === s.name
                          ? "bg-[#B88555] text-white border-[#B88555] shadow-sm"
                          : "bg-white text-[#181614] border-[rgba(28,24,20,0.1)] hover:border-[#B88555]"
                      }`}
                    >
                      <span className="text-xs font-bold block">{s.name}</span>
                      <span className={`text-[10px] block mt-0.5 ${designStyle === s.name ? "text-white/80" : "text-[#8E867B]"}`}>
                        {s.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SECTION 4: ASSIGNED MASTER SPECIALISTS ── */}
            <div className="bg-[#FAF8F5] border border-[rgba(28,24,20,0.1)] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(28,24,20,0.06)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#B88555] text-white flex items-center justify-center text-xs font-bold font-mono">
                      4
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#181614]">
                      Designated In-House Lead Specialist
                    </h2>
                  </div>
                  <p className="text-xs text-[#575149] mt-0.5">
                    Select the lead architectural craftsman who will oversee your {days}-day execution.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#8E867B] uppercase block">
                    Calculated Specialist Labor
                  </span>
                  <span className="font-display font-bold text-lg text-[#181614]">
                    ₹{totalLaborCost.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 block">
                    ({days} Days × ₹{selectedSpecialist.dayRate.toLocaleString("en-IN")}/day)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MASTER_SPECIALISTS.map((spec) => {
                  const isChosen = selectedSpecialistId === spec.id;
                  const specTotal = spec.dayRate * days;
                  return (
                    <div
                      key={spec.id}
                      onClick={() => setSelectedSpecialistId(spec.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isChosen
                          ? "bg-white border-[#B88555] ring-2 ring-[#B88555]/20 shadow-md"
                          : "bg-white/70 border-[rgba(28,24,20,0.08)] hover:border-[#B88555]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={spec.avatar}
                          alt={spec.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#B88555]/30"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-sm text-[#181614]">{spec.name}</span>
                            <span className="text-[10px] text-emerald-700 font-mono">✓ Verified</span>
                          </div>
                          <span className="text-[11px] text-[#575149] block leading-tight">{spec.role}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[rgba(28,24,20,0.06)] flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-[#8E867B] block">Daily Rate</span>
                          <span className="font-mono font-bold text-[#181614]">₹{spec.dayRate.toLocaleString("en-IN")}/d</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#8E867B] block">{days} Days Total</span>
                          <span className="font-mono font-bold text-[#B88555]">₹{specTotal.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          type="button"
                          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isChosen
                              ? "bg-[#B88555] text-white"
                              : "bg-[#EFECE6] text-[#575149] hover:text-[#181614]"
                          }`}
                        >
                          {isChosen ? "Selected Lead Specialist" : "Select Specialist"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feasibility Check Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-700 text-lg font-bold">✓</span>
                  <div>
                    <span className="font-bold text-emerald-900">Labor Feasibility Confirmed: </span>
                    <span className="text-emerald-800">
                      ₹{totalLaborCost.toLocaleString("en-IN")} for {days} days fits comfortably inside your ₹{budgetInLakhs}L budget (Labor allocation: ₹{laborShare.toLocaleString("en-IN")}).
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-xs hidden sm:inline">
                  {Math.round((totalLaborCost / budget) * 100)}% of Budget
                </span>
              </div>
            </div>

            {/* ── SECTION 5: CLIENT CONTACT DETAILS & MEETING APPOINTMENT ── */}
            <div className="bg-[#FAF8F5] border border-[rgba(28,24,20,0.1)] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(28,24,20,0.06)]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#181614] text-white flex items-center justify-center text-xs font-bold font-mono">
                    5
                  </span>
                  <div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#181614]">
                      Client Contact &amp; Consultation Slot
                    </h2>
                    <p className="text-xs text-[#575149]">
                      Lock your consultation appointment and quote with your verified contact information.
                    </p>
                  </div>
                </div>

                {!currentUser && (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="text-xs font-semibold text-[#B88555] hover:underline"
                  >
                    Already have an account? Sign In →
                  </button>
                )}
              </div>

              {/* Consultation Format Chips */}
              <div>
                <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-2">
                  Consultation Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "site", label: "🏡 On-Site Property Visit", desc: "Lead architect visits your residence with LiDAR" },
                    { id: "studio", label: "🏛 Design Studio Session", desc: "Visit our flagship studio in Indiranagar / Bandra" },
                    { id: "virtual", label: "💻 Virtual 3D AI Walkthrough", desc: "High-resolution 3D screen share & live CAD edit" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setConsultMode(m.id as any)}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        consultMode === m.id
                          ? "bg-[#181614] text-white border-[#181614] shadow-sm"
                          : "bg-white text-[#181614] border-[rgba(28,24,20,0.1)] hover:border-[#181614]"
                      }`}
                    >
                      <span className="text-xs font-bold block">{m.label}</span>
                      <span className={`text-[11px] block mt-0.5 ${consultMode === m.id ? "text-white/70" : "text-[#575149]"}`}>
                        {m.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-3 text-xs font-semibold text-[#181614] focus:outline-none focus:border-[#B88555]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5">
                    Time Slot
                  </label>
                  <select
                    value={meetingSlot}
                    onChange={(e) => setMeetingSlot(e.target.value)}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-3 text-xs font-semibold text-[#181614] focus:outline-none focus:border-[#B88555]"
                  >
                    <option value="Morning 10:30 AM">Morning: 10:30 AM – 12:00 PM</option>
                    <option value="Afternoon 02:30 PM">Afternoon: 02:30 PM – 04:00 PM</option>
                    <option value="Evening 06:00 PM">Evening: 06:00 PM – 07:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Client Contact Inputs (Name, Phone, Email, Location) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div>
                  <label htmlFor={nameInputId} className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    required
                    placeholder="e.g. Deepika Reddy"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-3 text-xs text-[#181614] placeholder-[#8E867B]/70 focus:outline-none focus:border-[#B88555]"
                  />
                </div>

                <div>
                  <label htmlFor={phoneInputId} className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5">
                    Contact Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={phoneInputId}
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-3 text-xs text-[#181614] font-mono placeholder-[#8E867B]/70 focus:outline-none focus:border-[#B88555]"
                  />
                </div>

                <div>
                  <label htmlFor={emailInputId} className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={emailInputId}
                    type="email"
                    required
                    placeholder="deepika@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-3 text-xs text-[#181614] placeholder-[#8E867B]/70 focus:outline-none focus:border-[#B88555]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5">
                    Project City / Location
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-3 text-xs font-semibold text-[#181614] focus:outline-none focus:border-[#B88555]"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Goa">Goa</option>
                  </select>
                </div>
              </div>

              {/* Special Notes Input */}
              <div>
                <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5">
                  Specific Work Requirements / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need pooja unit vastu orientation, fluted glass partitions, and zero-clearance wardrobe hardware."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-3 text-xs text-[#181614] placeholder-[#8E867B]/70 focus:outline-none focus:border-[#B88555]"
                />
              </div>

              {/* Submit Final Action Button */}
              <div className="pt-4 border-t border-[rgba(28,24,20,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#575149]">
                  <p className="font-semibold text-[#181614]">
                    Consultation is complimentary with full project engagement.
                  </p>
                  <p className="text-[11px] text-[#8E867B]">
                    Includes 3D LiDAR inspection, itemized BOQ quote, and guaranteed {days}-day delivery schedule.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-[#B88555] hover:bg-[#A07144] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Locking Consultation...</span>
                    </span>
                  ) : (
                    <>
                      <span>Lock Consultation &amp; Guaranteed Quote</span>
                      <span className="group-hover:translate-x-1 transition-transform">↗</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[rgba(28,24,20,0.08)] bg-[#FAF8F5] py-6 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E867B]">
          <p>© 2026 Sthavya Ltd. • Architectural Planning, Space Optimization &amp; Verified Craftsmen</p>
          <div className="flex gap-6">
            <button onClick={onBackToHome} className="hover:text-[#181614]">Overview</button>
            <button onClick={onOpenLogin} className="hover:text-[#181614]">Client Login</button>
            <span>Bangalore • Mumbai • Hyderabad • NCR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
