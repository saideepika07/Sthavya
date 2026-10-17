import { useState } from "react";
import type { HousePlan } from "../data/housePlansData";

interface House3DViewerProps {
  plan: HousePlan;
  onClose: () => void;
  onOpen2DBlueprint: (plan: HousePlan) => void;
  onRequestConsultation: (plan: HousePlan) => void;
}

export default function House3DViewer({
  plan,
  onClose,
  onOpen2DBlueprint,
  onRequestConsultation,
}: House3DViewerProps) {
  const [activePerspective, setActivePerspective] = useState<
    "isometric" | "exterior_front" | "exterior_side" | "interior_living" | "interior_master" | "interior_kitchen"
  >("isometric");

  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<string>(plan.designStyle);
  const [lightingMode, setLightingMode] = useState<"day" | "night">("day");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const perspectives = [
    { id: "isometric", label: "🏢 3D Cutaway Floor Layout", sub: "Interior Furniture & Flow" },
    { id: "exterior_front", label: "🏛 Front Elevation", sub: "Architectural Façade" },
    { id: "exterior_side", label: "📐 Side Elevation & Balconies", sub: "Depth & Pergola Details" },
    { id: "interior_living", label: "🛋 Living Room Interior", sub: "Double-Height Lounge" },
    { id: "interior_master", label: "🛏 Master Suite Interior", sub: "Wardrobe & Balcony Bay" },
    { id: "interior_kitchen", label: "🍳 Modular Kitchen", sub: "Island & Breakfast Bar" },
  ];

  const getActiveImage = () => {
    switch (activePerspective) {
      case "isometric":
        return plan.visualization3D.isometricCutaway;
      case "exterior_front":
        return plan.visualization3D.exteriorFront;
      case "exterior_side":
        return plan.visualization3D.exteriorSide;
      case "interior_living":
        return plan.visualization3D.interiorLiving;
      case "interior_master":
        return plan.visualization3D.interiorMasterBed;
      case "interior_kitchen":
        return plan.visualization3D.interiorKitchen;
      default:
        return plan.visualization3D.isometricCutaway;
    }
  };

  const currentFloor = plan.floorsData[activeFloorIndex] || plan.floorsData[0];

  return (
    <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fadeIn select-none">
      <div className="w-full max-w-7xl h-[95vh] bg-[#FAF8F5] border border-[rgba(28,24,20,0.18)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top 3D Header Bar */}
        <div className="px-5 py-3.5 bg-[#181614] text-white flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              ✦
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">{plan.name}</h3>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  Interactive 3D Render
                </span>
                <span className="text-[10px] font-mono text-white/70">
                  {plan.plotSizeSqYd} sq yd • {plan.bhk} BHK • {plan.floors}
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono">
                Real-time Light Simulation • Style: {selectedStyle} • 4K Architectural Mesh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpen2DBlueprint(plan)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
            >
              <span>2D CAD Blueprint</span>
              <span>↔</span>
            </button>

            <button
              onClick={() => onRequestConsultation(plan)}
              className="px-4 py-1.5 rounded-xl bg-[#B88555] hover:bg-[#A07144] text-xs font-semibold text-white shadow-sm transition-all"
            >
              Consult Architect on this 3D Design ↗
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors ml-2"
              title="Close 3D View"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 3D Visualizer Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Visual Display */}
          <div className="flex-1 bg-[#121110] relative flex items-center justify-center overflow-hidden">
            {/* Ambient Lighting Filter Simulation */}
            <div
              className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${
                lightingMode === "night"
                  ? "bg-indigo-950/40 mix-blend-multiply"
                  : "bg-amber-100/10 mix-blend-screen"
              }`}
            />

            {/* Main High-Res 3D Image with Transform */}
            <div
              style={{
                transform: `scale(${zoomScale}) rotate(${rotationAngle}deg)`,
                transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="relative max-w-full max-h-[68vh] p-4 flex items-center justify-center"
            >
              <img
                src={getActiveImage()}
                alt={`${plan.name} - ${activePerspective}`}
                className="rounded-2xl shadow-2xl object-cover max-h-[64vh] w-auto border border-white/10"
              />

              {/* Floating Overlay Badge on the Render */}
              <div className="absolute bottom-6 left-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-xs space-y-0.5">
                <span className="font-bold text-amber-300 block">
                  {perspectives.find((p) => p.id === activePerspective)?.label}
                </span>
                <span className="text-[10px] text-white/70 block">
                  {selectedStyle} Style • {lightingMode.toUpperCase()} LIGHTING • LEVEL: {currentFloor.floorLevel}
                </span>
              </div>
            </div>

            {/* Floating Orbit / Camera Controls */}
            <div className="absolute bottom-4 right-4 z-20 bg-[#181614]/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15 text-white flex items-center gap-2 text-xs">
              <button
                onClick={() => setRotationAngle((prev) => prev - 15)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                title="Rotate Left"
              >
                ↺
              </button>
              <button
                onClick={() => setRotationAngle((prev) => prev + 15)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                title="Rotate Right"
              >
                ↻
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.8, prev - 0.1))}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.min(1.6, prev + 0.1))}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => {
                  setRotationAngle(0);
                  setZoomScale(1);
                }}
                className="px-2 py-1 text-[10px] font-mono text-white/70 hover:text-white"
              >
                Reset
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Day / Night Toggle */}
              <button
                onClick={() => setLightingMode(lightingMode === "day" ? "night" : "day")}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium flex items-center gap-1.5"
              >
                <span>{lightingMode === "day" ? "☀️ Day" : "🌙 Night"}</span>
              </button>
            </div>
          </div>

          {/* Right Control Sidebar */}
          <div className="w-full lg:w-80 bg-[#FAF8F5] border-l border-[rgba(28,24,20,0.1)] p-5 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-5">
              {/* Floor Switcher */}
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-[#8E867B] mb-2">
                  Select Level View
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {plan.floorsData.map((fl, idx) => (
                    <button
                      key={fl.floorLevel}
                      onClick={() => setActiveFloorIndex(idx)}
                      className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                        activeFloorIndex === idx
                          ? "bg-[#181614] text-white border-[#181614]"
                          : "bg-white text-[#575149] border-[rgba(28,24,20,0.12)] hover:border-[#B88555]"
                      }`}
                    >
                      <span className="block truncate">{fl.floorLevel}</span>
                      <span className={`text-[10px] block ${activeFloorIndex === idx ? "text-amber-300" : "text-[#8E867B]"}`}>
                        {fl.builtUpAreaSqFt} sq ft
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Perspective Views Switcher */}
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-[#8E867B] mb-2">
                  Camera Perspective
                </label>
                <div className="space-y-1.5">
                  {perspectives.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePerspective(p.id as any)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        activePerspective === p.id
                          ? "bg-white border-[#B88555] shadow-xs ring-2 ring-[#B88555]/15"
                          : "bg-white/60 border-[rgba(28,24,20,0.08)] hover:bg-white"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-[#181614] block">{p.label}</span>
                        <span className="text-[10px] text-[#8E867B] block">{p.sub}</span>
                      </div>
                      {activePerspective === p.id && (
                        <span className="text-xs text-[#B88555] font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Architectural Style Switcher */}
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-[#8E867B] mb-2">
                  Architectural Style Finish
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {["Modern", "Minimalist", "Contemporary", "Traditional", "Luxury"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStyle(st)}
                      className={`py-2 px-2.5 rounded-xl font-semibold border transition-all text-center ${
                        selectedStyle === st
                          ? "bg-[#28362B] text-white border-[#28362B]"
                          : "bg-white text-[#575149] border-[rgba(28,24,20,0.12)] hover:border-[#28362B]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions & Details Card */}
            <div className="pt-4 border-t border-[rgba(28,24,20,0.08)] space-y-3">
              <div className="p-3 bg-[#EFECE6] rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#8E867B]">Estimated Build Cost:</span>
                  <span className="font-bold text-[#B88555]">₹{plan.estimatedCostLakhs} Lakhs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E867B]">Total Carpet:</span>
                  <span className="font-bold text-[#181614]">{plan.carpetAreaSqFt} sq.ft</span>
                </div>
              </div>

              <button
                onClick={() => onRequestConsultation(plan)}
                className="w-full py-3 px-4 rounded-xl bg-[#B88555] hover:bg-[#A07144] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Schedule 3D Walkthrough Session</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
