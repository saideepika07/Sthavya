import { useState } from "react";
import { PROFESSIONALS_DIRECTORY, type ProfessionalProfile, type ProfessionalCategory } from "../data/professionalsData";

interface ProfessionalDirectoryProps {
  onRequestConsultationWithPro: (pro: ProfessionalProfile) => void;
}

const CATEGORIES: ("All" | ProfessionalCategory)[] = [
  "All",
  "Architect",
  "Civil Engineer",
  "Structural Engineer",
  "Interior Designer",
  "3D Designer",
  "Electrical Engineer",
  "Plumbing Professional",
  "Contractor",
  "Construction Team",
];

export default function ProfessionalDirectory({
  onRequestConsultationWithPro,
}: ProfessionalDirectoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | ProfessionalCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = PROFESSIONALS_DIRECTORY.filter((p) => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.services.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <section id="professionals-directory" className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgba(28,24,20,0.1)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFECE6] border border-[rgba(28,24,20,0.08)] text-xs font-mono text-[#B88555] font-semibold mb-3">
            <span>✦</span>
            <span>VERIFIED PROFESSIONAL DIRECTORY</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[#181614]">
            Council-Certified Architects &amp; Master Builders
          </h2>
          <p className="text-sm text-[#575149] max-w-2xl mt-1 leading-relaxed">
            Zero agency markups. Connect directly with specialized civil engineers, structural consultants, interior architects, and turnkey contractors through verified platform scheduling.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search by name, trade or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-2xl px-4 py-2.5 text-xs text-[#181614] placeholder-[#8E867B] focus:outline-none focus:border-[#B88555] shadow-xs"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-[#181614] text-white shadow-xs"
                : "bg-white text-[#575149] border border-[rgba(28,24,20,0.1)] hover:border-[#B88555]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pro) => (
          <div
            key={pro.id}
            className="bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] p-6 shadow-xs space-y-5 hover:border-[#B88555] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <img
                  src={pro.avatar}
                  alt={pro.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#B88555]/30 shadow-xs"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-[#181614]">{pro.name}</h3>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#575149] font-medium leading-snug">{pro.role}</p>
                  <p className="text-[11px] text-[#8E867B] font-mono mt-0.5">
                    📍 {pro.location} • {pro.experience}y Experience
                  </p>
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-xs text-[#575149] leading-relaxed line-clamp-2">
                {pro.bio}
              </p>

              {/* Services Badges */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E867B] font-bold block">
                  Core Specializations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pro.services.slice(0, 3).map((srv) => (
                    <span
                      key={srv}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[rgba(28,24,20,0.06)] text-[10px] text-[#575149] font-medium"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Working Hours & Fee Strip */}
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[rgba(28,24,20,0.06)] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8E867B] block text-[10px]">Session Fee</span>
                  <span className="font-display font-bold text-base text-[#B88555]">
                    ₹{pro.consultationFee}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#8E867B] block text-[10px]">Rating</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ★ {pro.rating} ({pro.reviewsCount})
                  </span>
                </div>
              </div>

              {/* Next Available Slot indicator */}
              <div className="text-[11px] text-[#575149] flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Next Slot: <strong>{pro.availableSlots[0]?.date || "Tomorrow"} at {pro.availableSlots[0]?.slots[0] || "10:00 AM"}</strong></span>
              </div>
            </div>

            {/* Request Button */}
            <button
              onClick={() => onRequestConsultationWithPro(pro)}
              className="w-full py-3 px-4 rounded-xl bg-[#28362B] hover:bg-[#1E2B22] text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Request Consultation with {pro.name.split(" ")[1] || pro.name}</span>
              <span>↗</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
