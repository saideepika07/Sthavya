import { useState } from "react";

interface EstimateProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToConsultation: (details: {
    projectType: string;
    areaSqFt: number;
    tier: string;
    estimatedCost: number;
  }) => void;
}

export default function EstimateCalculatorModal({
  isOpen,
  onClose,
  onProceedToConsultation,
}: EstimateProps) {
  const [projectType, setProjectType] = useState("Full Apartment");
  const [areaSqFt, setAreaSqFt] = useState(1200);
  const [tier, setTier] = useState<"Minimalist" | "Warm Luxury" | "Monolithic Bespoke">("Warm Luxury");

  if (!isOpen) return null;

  // Pricing constants (INR standard for regional context, adaptable)
  const rates = {
    Minimalist: 1900,
    "Warm Luxury": 3200,
    "Monolithic Bespoke": 4800,
  };

  const currentRate = rates[tier];
  const totalCost = areaSqFt * currentRate;
  const millworkCost = Math.round(totalCost * 0.45);
  const civilCost = Math.round(totalCost * 0.35);
  const supervisionCost = Math.round(totalCost * 0.2);

  // Timeline
  const weeks = areaSqFt < 800 ? "4 - 6" : areaSqFt < 1800 ? "8 - 10" : "12 - 16";

  const handleBook = () => {
    onProceedToConsultation({
      projectType,
      areaSqFt,
      tier,
      estimatedCost: totalCost,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[rgba(28,24,20,0.12)] max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[rgba(28,24,20,0.08)] flex items-center justify-between bg-white rounded-t-3xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B88555] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#8E867B] font-semibold">
                Devun Architectural Estimator
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-[#181614] mt-1">
              Calculate Project Estimate
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center text-xs font-bold text-[#181614] hover:bg-[#E4DFD6] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 flex-1">
          {/* 1. Project Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#575149] block mb-2">
              1. Project Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["Full Apartment", "Villa / Penthouse", "Kitchen & Joinery", "Single Room"].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setProjectType(type)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      projectType === type
                        ? "bg-[#181614] text-white border-[#181614]"
                        : "bg-white text-[#181614] border-[rgba(28,24,20,0.12)] hover:border-[#181614]"
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 2. Carpet Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#575149]">
                2. Total Built-Up Area
              </label>
              <span className="font-mono text-sm font-bold text-[#181614] bg-white px-3 py-1 rounded-lg border border-[rgba(28,24,20,0.1)]">
                {areaSqFt.toLocaleString()} sq ft
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="5000"
              step="50"
              value={areaSqFt}
              onChange={(e) => setAreaSqFt(Number(e.target.value))}
              className="w-full accent-[#B88555] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E867B] font-mono mt-1">
              <span>Studio (300 sq ft)</span>
              <span>2-3 BHK (1,400 sq ft)</span>
              <span>Luxury Villa (5,000 sq ft)</span>
            </div>
          </div>

          {/* 3. Finish Grade */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#575149] block mb-2">
              3. Architectural Finish Grade
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "Minimalist" as const,
                  name: "Minimalist",
                  rate: "₹1,900 / sq ft",
                  detail: "Matte lacquers, engineered oak, clean recessed lighting",
                },
                {
                  id: "Warm Luxury" as const,
                  name: "Warm Luxury",
                  rate: "₹3,200 / sq ft",
                  detail: "Solid white oak, Roman travertine, fluted glass, smart automation",
                },
                {
                  id: "Monolithic Bespoke" as const,
                  name: "Monolithic Bespoke",
                  rate: "₹4,800 / sq ft",
                  detail: "Hand-carved stone, imported European millwork, acoustic wall slats",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTier(item.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    tier === item.id
                      ? "bg-[#28362B] text-white border-[#28362B] shadow-sm"
                      : "bg-white text-[#181614] border-[rgba(28,24,20,0.12)] hover:border-[#28362B]"
                  }`}
                >
                  <div className="text-xs font-bold">{item.name}</div>
                  <div className={`text-[11px] font-mono mt-0.5 ${tier === item.id ? "text-amber-200" : "text-[#B88555]"}`}>
                    {item.rate}
                  </div>
                  <div className={`text-[10px] mt-2 leading-tight ${tier === item.id ? "text-white/80" : "text-[#575149]"}`}>
                    {item.detail}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-2xl p-5 border border-[rgba(28,24,20,0.1)] shadow-inner space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[rgba(28,24,20,0.08)]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#8E867B] block">
                  Estimated Turnkey Investment
                </span>
                <div className="font-display font-bold text-2xl md:text-3xl text-[#181614] mt-0.5">
                  ₹{totalCost.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#8E867B] block">
                  Terms of Execution
                </span>
                <span className="text-sm font-bold text-[#28362B] font-mono">
                  {weeks} Weeks Turnkey
                </span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#FAF8F5] rounded-xl">
                <div className="text-[10px] text-[#8E867B]">Bespoke Joinery (45%)</div>
                <div className="font-bold text-[#181614] font-mono mt-0.5">
                  ₹{millworkCost.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded-xl">
                <div className="text-[10px] text-[#8E867B]">Civil &amp; Finishes (35%)</div>
                <div className="font-bold text-[#181614] font-mono mt-0.5">
                  ₹{civilCost.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded-xl">
                <div className="text-[10px] text-[#8E867B]">Architect Lead (20%)</div>
                <div className="font-bold text-[#181614] font-mono mt-0.5">
                  ₹{supervisionCost.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-[rgba(28,24,20,0.08)] bg-white rounded-b-3xl flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#575149] hover:text-[#181614] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBook}
            className="bg-[#CCA46B] hover:bg-[#B88E52] text-white px-6 py-3 rounded-xl font-medium text-xs md:text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>Lock Estimate &amp; Book Consultation</span>
            <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}
