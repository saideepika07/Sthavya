import { useState } from "react";
import { HOUSE_PLANS_DATA, type HousePlan } from "../data/housePlansData";
import { housePlanningService, type CustomPlotInputs, type PlotValidationResult } from "../services/housePlanningService";
import { downloadBlueprintAsPdf } from "../services/blueprintPdfService";

interface SmartPlanBrowserProps {
  onOpenBlueprint: (plan: HousePlan) => void;
  onOpen3D: (plan: HousePlan) => void;
  onRequestConsultation: (plan: HousePlan) => void;
  onOpenComparison: (plans: HousePlan[]) => void;
}

const PLOT_SIZE_PRESETS = [
  { sqYd: 75, label: "75 sq yd", desc: "Compact Pod (675 sq ft)" },
  { sqYd: 100, label: "100 sq yd", desc: "Classic Suburban (900 sq ft)" },
  { sqYd: 125, label: "125 sq yd", desc: "Standard 3BHK (1,125 sq ft)" },
  { sqYd: 150, label: "150 sq yd", desc: "Courtyard Villa (1,350 sq ft)" },
  { sqYd: 200, label: "200 sq yd", desc: "Executive Duplex (1,800 sq ft)" },
  { sqYd: 250, label: "250 sq yd", desc: "Grand Sovereign (2,250 sq ft)" },
  { sqYd: 300, label: "300 sq yd", desc: "Skyview Mansion (2,700 sq ft)" },
  { sqYd: 400, label: "400+ sq yd", desc: "Luxury Estate (3,600+ sq ft)" },
];

export default function SmartPlanBrowser({
  onOpenBlueprint,
  onOpen3D,
  onRequestConsultation,
  onOpenComparison,
}: SmartPlanBrowserProps) {
  // Primary Matrix State
  const [selectedPlotSize, setSelectedPlotSize] = useState<number>(150);
  const [selectedBhk, setSelectedBhk] = useState<number>(3);
  const [selectedFloors, setSelectedFloors] = useState<string>("G+1");

  // Secondary Filters
  const [selectedStyle, setSelectedStyle] = useState<string>("All");
  const [maxBudget, setMaxBudget] = useState<number>(120);
  const [hasParkingFilter, setHasParkingFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Custom Plot Modal
  const [customPlotModalOpen, setCustomPlotModalOpen] = useState(false);
  const [customInputs, setCustomInputs] = useState<CustomPlotInputs>({
    unit: "sq yd",
    area: 150,
    length: 45,
    width: 30,
  });
  const [validationResult, setValidationResult] = useState<PlotValidationResult | null>(null);

  // Selected for Comparison (up to 3)
  const [comparedPlanIds, setComparedPlanIds] = useState<string[]>([]);

  // Saved Plan IDs for toggle
  const [savedPlanIds, setSavedPlanIds] = useState<string[]>(() => housePlanningService.getSavedPlanIds());

  // Detail Modal
  const [detailModalPlan, setDetailModalPlan] = useState<HousePlan | null>(null);

  // Filter plans
  const filteredPlans = housePlanningService.getPlans({
    plotSizeSqYd: selectedPlotSize,
    bhk: selectedBhk,
    floors: selectedFloors,
    designStyle: selectedStyle,
    maxBudgetLakhs: maxBudget,
    hasParking: hasParkingFilter,
    search: searchQuery,
  });

  const handleValidateCustomPlot = () => {
    const res = housePlanningService.validatePlotDimensions(customInputs);
    setValidationResult(res);
    if (res.isValid) {
      setSelectedPlotSize(res.convertedAreaSqYd);
    }
  };

  const handleApplyCustomPlot = () => {
    if (validationResult && validationResult.isValid) {
      setSelectedPlotSize(validationResult.convertedAreaSqYd);
      setCustomPlotModalOpen(false);
    } else {
      handleValidateCustomPlot();
    }
  };

  const toggleCompare = (planId: string) => {
    if (comparedPlanIds.includes(planId)) {
      setComparedPlanIds(comparedPlanIds.filter((id) => id !== planId));
    } else {
      if (comparedPlanIds.length >= 3) {
        alert("You can compare up to 3 plans at a time.");
        return;
      }
      setComparedPlanIds([...comparedPlanIds, planId]);
    }
  };

  const handleSaveToggle = (planId: string) => {
    housePlanningService.toggleSavePlan(planId);
    setSavedPlanIds(housePlanningService.getSavedPlanIds());
  };

  const handleTriggerCompareModal = () => {
    const matched = HOUSE_PLANS_DATA.filter((p) => comparedPlanIds.includes(p.id));
    if (matched.length > 0) {
      onOpenComparison(matched);
    } else {
      // Compare all current filtered plans up to 3
      onOpenComparison(filteredPlans.slice(0, 3));
    }
  };

  return (
    <section id="house-plans-explorer" className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
      {/* Explorer Title & Tagline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgba(28,24,20,0.1)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFECE6] border border-[rgba(28,24,20,0.08)] text-xs font-mono text-[#B88555] font-semibold mb-3">
            <span>✦</span>
            <span>SMART ARCHITECTURAL PLAN GENERATOR</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[#181614] tracking-tight">
            Explore Code-Compliant Residential House Plans
          </h2>
          <p className="text-sm text-[#575149] max-w-2xl mt-1 leading-relaxed">
            Select your exact plot size, BHK configuration, and number of floors. Every plan comes with multi-floor 2D CAD drawings, interactive 3D visualizations, and verified in-house builder matching.
          </p>
        </div>

        {/* Comparison Trigger Pill */}
        {comparedPlanIds.length > 0 && (
          <button
            onClick={handleTriggerCompareModal}
            className="px-5 py-2.5 rounded-full bg-[#B88555] hover:bg-[#A07144] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>Compare Selected ({comparedPlanIds.length})</span>
            <span>⚖</span>
          </button>
        )}
      </div>

      {/* MATRIX CONTROLS: PLOT SIZE, BHK, FLOORS */}
      <div className="bg-[#FAF8F5] border border-[rgba(28,24,20,0.1)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Row 1: Plot Size Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-bold text-sm text-[#181614] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#181614] text-white text-[10px] flex items-center justify-center font-mono">1</span>
              <span>Plot Size Selection</span>
            </span>
            <button
              onClick={() => {
                setValidationResult(null);
                setCustomPlotModalOpen(true);
              }}
              className="text-xs font-semibold text-[#B88555] hover:underline flex items-center gap-1"
            >
              <span>📐 Custom Plot Dimensions</span>
              <span>↗</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {PLOT_SIZE_PRESETS.map((p) => {
              const isSelected = selectedPlotSize === p.sqYd;
              return (
                <button
                  key={p.sqYd}
                  onClick={() => setSelectedPlotSize(p.sqYd)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "bg-[#181614] text-white border-[#181614] shadow-xs"
                      : "bg-white text-[#575149] border-[rgba(28,24,20,0.12)] hover:border-[#B88555]"
                  }`}
                >
                  <span className="font-bold text-xs block">{p.label}</span>
                  <span className={`text-[10px] block mt-0.5 truncate ${isSelected ? "text-amber-300" : "text-[#8E867B]"}`}>
                    {p.desc.split("(")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: BHK & Floor Selector in 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[rgba(28,24,20,0.06)]">
          {/* BHK Selector */}
          <div>
            <label className="font-display font-bold text-sm text-[#181614] mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#181614] text-white text-[10px] flex items-center justify-center font-mono">2</span>
              <span>BHK Requirement</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBhk(b)}
                  className={`py-3 rounded-2xl font-semibold text-xs border text-center transition-all ${
                    selectedBhk === b
                      ? "bg-[#28362B] text-white border-[#28362B] shadow-xs"
                      : "bg-white text-[#575149] border-[rgba(28,24,20,0.12)] hover:border-[#28362B]"
                  }`}
                >
                  {b} BHK
                </button>
              ))}
            </div>
          </div>

          {/* Floors Selector */}
          <div>
            <label className="font-display font-bold text-sm text-[#181614] mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#181614] text-white text-[10px] flex items-center justify-center font-mono">3</span>
              <span>Floor Configuration</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["Ground Floor", "G+1", "G+2", "G+3"].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloors(fl)}
                  className={`py-3 rounded-2xl font-semibold text-xs border text-center transition-all ${
                    selectedFloors === fl
                      ? "bg-[#B88555] text-white border-[#B88555] shadow-xs"
                      : "bg-white text-[#575149] border-[rgba(28,24,20,0.12)] hover:border-[#B88555]"
                  }`}
                >
                  {fl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Secondary Smart Filters Bar */}
        <div className="pt-4 border-t border-[rgba(28,24,20,0.06)] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Style Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8E867B] font-mono text-[11px]">Style:</span>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="bg-white border border-[rgba(28,24,20,0.15)] rounded-xl px-2.5 py-1.5 font-semibold text-[#181614]"
              >
                <option value="All">All Styles</option>
                <option value="Modern">Modern</option>
                <option value="Minimalist">Minimalist</option>
                <option value="Contemporary">Contemporary</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            {/* Parking filter */}
            <button
              onClick={() => setHasParkingFilter(!hasParkingFilter)}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                hasParkingFilter
                  ? "bg-white border-[#B88555] text-[#181614]"
                  : "bg-transparent border-[rgba(28,24,20,0.15)] text-[#575149]"
              }`}
            >
              🚗 Car Portico Required
            </button>
          </div>

          {/* Budget Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[#8E867B] font-mono text-[11px]">Max Budget:</span>
            <input
              type="range"
              min={15}
              max={160}
              step={5}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-32 h-2 bg-[#EFECE6] rounded-lg accent-[#B88555]"
            />
            <span className="font-mono font-bold text-xs text-[#B88555]">
              ₹{maxBudget} L
            </span>
          </div>

          {/* Search query */}
          <div className="w-full sm:w-56">
            <input
              type="text"
              placeholder="Search layout features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#181614]"
            />
          </div>
        </div>
      </div>

      {/* PLAN CARDS GRID (With Multiple Variations & Comparison) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#575149]">
          <span>Showing <strong>{filteredPlans.length}</strong> matching architectural layout(s)</span>
          <button
            onClick={handleTriggerCompareModal}
            className="text-[#B88555] font-semibold hover:underline"
          >
            Compare Layout Variations ⚖
          </button>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] space-y-3">
            <span className="text-3xl">📐</span>
            <h3 className="font-display font-bold text-lg text-[#181614]">No exact layouts matching these filters</h3>
            <p className="text-xs text-[#575149] max-w-sm mx-auto">
              Try adjusting your BHK, floor configuration or plot size brackets above to browse available concept drawings.
            </p>
            <button
              onClick={() => {
                setSelectedPlotSize(150);
                setSelectedBhk(3);
                setSelectedFloors("G+1");
                setSelectedStyle("All");
                setMaxBudget(120);
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-[#28362B] text-white text-xs font-semibold"
            >
              Reset to 150 sq yd 3BHK G+1
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const isSaved = savedPlanIds.includes(plan.id);
              const isCompared = comparedPlanIds.includes(plan.id);

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] hover:border-[#B88555] p-5 shadow-xs space-y-4 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Render Image Banner */}
                    <div className="relative rounded-2xl overflow-hidden h-48 bg-[#121110]">
                      <img
                        src={plan.visualization3D.exteriorFront}
                        alt={plan.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-[#181614]/85 text-amber-300 font-mono text-[10px] font-bold uppercase backdrop-blur-md">
                          {plan.variation}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#181614] font-mono text-[10px] font-semibold">
                          {plan.designStyle}
                        </span>
                      </div>

                      {/* Save Heart Button */}
                      <button
                        onClick={() => handleSaveToggle(plan.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-rose-600 flex items-center justify-center text-xs shadow-md transition-transform active:scale-90"
                        title={isSaved ? "Saved" : "Save Plan"}
                      >
                        {isSaved ? "♥" : "♡"}
                      </button>

                      {/* Price Tag */}
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#B88555] text-white font-bold text-xs shadow-md">
                        ₹{plan.estimatedCostLakhs} Lakhs
                      </div>
                    </div>

                    {/* Plan Header Info */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-base text-[#181614] leading-snug">
                          {plan.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#575149] mt-0.5 line-clamp-2 leading-relaxed">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Technical Parameter Chips */}
                    <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[rgba(28,24,20,0.06)] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Plot Dimensions</span>
                        <strong className="text-[#181614]">
                          {plan.plotDimensions.lengthFt}&apos; × {plan.plotDimensions.widthFt}&apos; ({plan.plotSizeSqYd} sq yd)
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Configuration</span>
                        <strong className="text-[#181614]">{plan.bhk} BHK • {plan.floors}</strong>
                      </div>
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Built-up Area</span>
                        <strong className="text-[#181614] font-mono">{plan.builtUpAreaSqFt} sq.ft</strong>
                      </div>
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Carpet Area</span>
                        <strong className="text-[#575149] font-mono">{plan.carpetAreaSqFt} sq.ft</strong>
                      </div>
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Bedrooms &amp; Baths</span>
                        <strong className="text-[#181614]">{plan.bedrooms} Beds • {plan.bathrooms} Baths</strong>
                      </div>
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Parking &amp; Balcony</span>
                        <strong className="text-[#181614] truncate block">{plan.parkingSpaces}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Buttons as specified in Item 7 */}
                  <div className="space-y-2 pt-2 text-xs">
                    {/* Primary Two Buttons: View Blueprint & View 3D */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOpenBlueprint(plan)}
                        className="py-2.5 px-3 rounded-xl border border-[rgba(28,24,20,0.15)] bg-white hover:bg-[#FAF8F5] font-semibold text-[#181614] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>📐 View Blueprint</span>
                      </button>

                      <button
                        onClick={() => onOpen3D(plan)}
                        className="py-2.5 px-3 rounded-xl border border-[rgba(28,24,20,0.15)] bg-white hover:bg-[#FAF8F5] font-semibold text-[#181614] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>✦ View 3D</span>
                      </button>
                    </div>

                    {/* Secondary Row: View Details & Request Consultation */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDetailModalPlan(plan)}
                        className="py-2.5 px-3 rounded-xl bg-[#EFECE6] hover:bg-[#E4DFD6] font-semibold text-[#575149] transition-colors text-center"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => onRequestConsultation(plan)}
                        className="py-2.5 px-3 rounded-xl bg-[#28362B] hover:bg-[#1E2B22] text-white font-semibold shadow-xs transition-colors text-center"
                      >
                        Request Consultation ↗
                      </button>
                    </div>

                    {/* Compare Checkbox Toggle */}
                    <div className="flex items-center justify-between pt-1 px-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-[#575149]">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(plan.id)}
                          className="rounded border-[rgba(28,24,20,0.2)] text-[#B88555] focus:ring-[#B88555]"
                        />
                        <span>Compare with other variations</span>
                      </label>

                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                        ★ {plan.circulationRating}/10 Flow
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CUSTOM PLOT SIZE MODAL (Section 2 Requirement) */}
      {customPlotModalOpen && (
        <div className="fixed inset-0 z-[10001] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="w-full max-w-lg bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(28,24,20,0.08)]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#181614]">Custom Plot Dimensions</h3>
                <p className="text-xs text-[#575149]">Enter your exact land survey measurements</p>
              </div>
              <button
                onClick={() => setCustomPlotModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#EFECE6] flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Unit Selector */}
              <div>
                <label className="font-bold text-[#575149] block mb-1">Measurement Unit</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["sq yd", "sq ft", "meters"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setCustomInputs({ ...customInputs, unit: u })}
                      className={`py-2 rounded-xl font-semibold border ${
                        customInputs.unit === u
                          ? "bg-[#181614] text-white border-[#181614]"
                          : "bg-white text-[#575149] border-[rgba(28,24,20,0.15)]"
                      }`}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area & Dimensions */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#575149] block mb-1">Plot Area *</label>
                  <input
                    type="number"
                    value={customInputs.area}
                    onChange={(e) => setCustomInputs({ ...customInputs, area: Number(e.target.value) })}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#575149] block mb-1">Length</label>
                  <input
                    type="number"
                    value={customInputs.length}
                    onChange={(e) => setCustomInputs({ ...customInputs, length: Number(e.target.value) })}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#575149] block mb-1">Width</label>
                  <input
                    type="number"
                    value={customInputs.width}
                    onChange={(e) => setCustomInputs({ ...customInputs, width: Number(e.target.value) })}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleValidateCustomPlot}
                className="w-full py-2.5 bg-[#EFECE6] hover:bg-[#E4DFD6] font-semibold rounded-xl text-[#181614] text-xs"
              >
                Validate Dimensions &amp; Calculate Setbacks 🔍
              </button>

              {/* Validation Result Box */}
              {validationResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    validationResult.isValid
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{validationResult.isValid ? "✓ Dimensions Validated" : "⚠️ Validation Notice"}</span>
                    <span className="font-mono">{validationResult.convertedAreaSqYd} Sq. Yds ({validationResult.convertedAreaSqFt} Sq. Ft)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>Front Setback: <strong>{validationResult.minFrontSetbackFt} ft</strong></div>
                    <div>Rear Setback: <strong>{validationResult.minRearSetbackFt} ft</strong></div>
                    <div>Max Ground Coverage: <strong>{validationResult.maxGroundCoverageSqFt} sq.ft</strong></div>
                    <div>Recommended: <strong>{validationResult.recommendedBhk} ({validationResult.recommendedFloors})</strong></div>
                  </div>

                  {validationResult.validationMessages.length > 0 && (
                    <ul className="list-disc pl-4 text-[10px] space-y-0.5 text-[#575149]">
                      {validationResult.validationMessages.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomPlotModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#EFECE6] font-semibold text-[#575149]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomPlot}
                  className="flex-1 py-3 rounded-xl bg-[#B88555] hover:bg-[#A07144] text-white font-semibold shadow-md"
                >
                  Apply &amp; Filter Plans ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLAN DETAILS MODAL */}
      {detailModalPlan && (
        <div className="fixed inset-0 z-[10001] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="w-full max-w-2xl bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(28,24,20,0.08)]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-xl text-[#181614]">{detailModalPlan.name}</h3>
                  <span className="font-mono text-[10px] uppercase bg-black text-amber-300 px-2 py-0.5 rounded font-bold">
                    {detailModalPlan.variation}
                  </span>
                </div>
                <p className="text-xs text-[#575149] mt-0.5">{detailModalPlan.tagline}</p>
              </div>
              <button
                onClick={() => setDetailModalPlan(null)}
                className="w-7 h-7 rounded-full bg-[#EFECE6] flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)] space-y-2">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#B88555]">
                  Architectural Summary &amp; Space Intelligence
                </h4>
                <p className="text-[#575149] leading-relaxed">
                  {detailModalPlan.architectNote}
                </p>
              </div>

              {/* Floor-by-floor breakdown */}
              <div className="space-y-2">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#575149]">
                  Floor Schedule Distribution
                </h4>
                {detailModalPlan.floorsData.map((f) => (
                  <div key={f.floorLevel} className="p-3 bg-white rounded-xl border border-[rgba(28,24,20,0.06)] space-y-1">
                    <div className="flex justify-between font-bold text-[#181614]">
                      <span>{f.floorLevel}</span>
                      <span className="font-mono text-[#B88555]">{f.builtUpAreaSqFt} sq.ft</span>
                    </div>
                    <p className="text-[11px] text-[#575149]">
                      Rooms: {f.rooms.map((r) => `${r.name} (${r.dimensions})`).join(" • ")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    const p = detailModalPlan;
                    setDetailModalPlan(null);
                    onOpenBlueprint(p);
                  }}
                  className="py-3 rounded-xl border border-[rgba(28,24,20,0.15)] bg-white hover:bg-[#FAF8F5] font-semibold text-[#181614] cursor-pointer"
                >
                  📐 Open 2D Blueprint Viewer
                </button>
                <button
                  onClick={() => {
                    const p = detailModalPlan;
                    setDetailModalPlan(null);
                    onRequestConsultation(p);
                  }}
                  className="py-3 rounded-xl bg-[#28362B] hover:bg-[#1E2B22] text-white font-semibold shadow-md cursor-pointer"
                >
                  Request Consultation ↗
                </button>
              </div>

              <button
                onClick={async () => {
                  if (detailModalPlan) {
                    await downloadBlueprintAsPdf({ plan: detailModalPlan, theme: "vellum" });
                  }
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE6DF] border border-[rgba(28,24,20,0.15)] text-[#181614] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Download architectural floor plan as A3 landscape vector PDF"
              >
                <span>📄</span>
                <span>Download Blueprint as PDF (A3 Vector)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
