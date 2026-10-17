import type { HousePlan } from "../data/housePlansData";

interface PlanComparisonModalProps {
  plans: HousePlan[];
  onClose: () => void;
  onSelectPlan: (plan: HousePlan) => void;
  onOpenBlueprint: (plan: HousePlan) => void;
  onOpen3D: (plan: HousePlan) => void;
}

export default function PlanComparisonModal({
  plans,
  onClose,
  onSelectPlan,
  onOpenBlueprint,
  onOpen3D,
}: PlanComparisonModalProps) {
  if (plans.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn select-none">
      <div className="w-full max-w-6xl max-h-[92vh] bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#181614] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#B88555] flex items-center justify-center text-white font-bold text-sm">
              ⚖
            </span>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Compare House Layouts</h3>
              <p className="text-xs text-white/60">
                Evaluating {plans.length} architectural variations side-by-side
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className="bg-white border-2 border-[rgba(28,24,20,0.1)] hover:border-[#B88555] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden h-44 bg-[#121110]">
                    <img
                      src={p.visualization3D.exteriorFront}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#181614]/80 text-amber-300 font-mono text-[10px] font-bold uppercase backdrop-blur-md">
                      {p.variation}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#B88555] text-white font-bold text-xs shadow-sm">
                      ₹{p.estimatedCostLakhs} L
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-lg text-[#181614] leading-snug">{p.name}</h4>
                    <p className="text-xs text-[#575149] mt-0.5">{p.tagline}</p>
                  </div>

                  {/* Metrics Table */}
                  <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[rgba(28,24,20,0.06)] text-xs space-y-2">
                    <div className="flex justify-between pb-1.5 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Plot Size</span>
                      <span className="font-semibold text-[#181614]">{p.plotSizeSqYd} sq yd ({p.plotDimensions.lengthFt}&apos;×{p.plotDimensions.widthFt}&apos;)</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Floors</span>
                      <span className="font-semibold text-[#181614]">{p.floors}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Built-up Area</span>
                      <span className="font-mono font-bold text-[#181614]">{p.builtUpAreaSqFt} sq.ft</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Carpet Area</span>
                      <span className="font-mono text-[#575149]">{p.carpetAreaSqFt} sq.ft</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Bedrooms / Baths</span>
                      <span className="font-semibold text-[#181614]">{p.bedrooms} Beds • {p.bathrooms} Baths</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Parking</span>
                      <span className="font-semibold text-[#181614]">{p.parkingSpaces}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Balconies</span>
                      <span className="font-semibold text-[#181614]">{p.balconies} Balconies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E867B]">Circulation Score</span>
                      <span className="font-mono font-bold text-emerald-700">{p.circulationRating} / 10</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onOpenBlueprint(p)}
                      className="py-2.5 rounded-xl border border-[rgba(28,24,20,0.15)] bg-white hover:bg-[#FAF8F5] font-semibold text-[#181614]"
                    >
                      📐 2D Blueprint
                    </button>
                    <button
                      onClick={() => onOpen3D(p)}
                      className="py-2.5 rounded-xl border border-[rgba(28,24,20,0.15)] bg-white hover:bg-[#FAF8F5] font-semibold text-[#181614]"
                    >
                      ✦ 3D Views
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onSelectPlan(p);
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-[#28362B] hover:bg-[#1E2B22] text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    Select This Layout ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
