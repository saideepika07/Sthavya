import { useState, useRef, useEffect } from "react";
import type { HousePlan, FloorBlueprint } from "../data/housePlansData";
import { getCurrentUser } from "../services/auth";
import {
  getSocket,
  joinFloorPlan,
  leaveFloorPlan,
  broadcastRoomMove,
} from "../services/socket";
import {
  downloadBlueprintAsPdf,
  getBlueprintPdfFilename,
} from "../services/blueprintPdfService";

interface Blueprint2DViewerProps {
  plan: HousePlan;
  onClose: () => void;
  onRequestConsultation: (plan: HousePlan) => void;
  onOpen3DView: (plan: HousePlan) => void;
}

export default function Blueprint2DViewer({
  plan,
  onClose,
  onRequestConsultation,
  onOpen3DView,
}: Blueprint2DViewerProps) {
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [roomOverrides, setRoomOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"vellum" | "cyan">("vellum");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const planId = plan.id || (plan as any)._id || (plan as any).planId || "default-plan";

  // Socket.io real-time collaboration
  useEffect(() => {
    const user = getCurrentUser();
    joinFloorPlan(planId, user);

    const s = getSocket();
    const handleCollab = (data: any) => {
      if (data.planId === planId) {
        setCollaborators(data.collaborators || []);
      }
    };

    const handleRoomMoved = (data: any) => {
      setRoomOverrides((prev) => ({
        ...prev,
        [data.roomId]: { x: data.x, y: data.y },
      }));
    };

    s.on("plan:collaborators-updated", handleCollab);
    s.on("plan:room-moved", handleRoomMoved);

    return () => {
      leaveFloorPlan(planId);
      s.off("plan:collaborators-updated", handleCollab);
      s.off("plan:room-moved", handleRoomMoved);
    };
  }, [planId]);

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/#plan=${planId}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handleNudgeRoom = (roomId: string, currentX: number, currentY: number, dx: number, dy: number) => {
    const newX = Math.max(0, Math.min(80, currentX + dx));
    const newY = Math.max(0, Math.min(80, currentY + dy));
    setRoomOverrides((prev) => ({
      ...prev,
      [roomId]: { x: newX, y: newY },
    }));
    broadcastRoomMove(planId, roomId, newX, newY, getCurrentUser());
  };

  const activeFloor: FloorBlueprint = plan.floorsData[activeFloorIndex] || plan.floorsData[0];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.6, Number((prev + delta).toFixed(1)))));
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svgEl = document.getElementById("blueprint-canvas-svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.name.replace(/\s+/g, "_")}_${activeFloor.floorLevel.replace(/\s+/g, "_")}_Blueprint.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setToastMessage("📐 Generating vector A3 architectural PDF blueprint...");
    try {
      const svgEl = document.getElementById("blueprint-canvas-svg") as SVGElement | null;
      const containerEl = document.getElementById("blueprint-transform-container") as HTMLElement | null;
      await downloadBlueprintAsPdf({
        plan,
        activeFloorIndex,
        theme,
        svgElement: svgEl,
        containerElement: containerEl,
      });
      const filename = getBlueprintPdfFilename(plan);
      setToastMessage(`✓ Blueprint PDF downloaded: ${filename}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      setToastMessage("⚠ Failed to generate blueprint PDF. Please try again.");
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getRoomColor = (type: string) => {
    if (theme === "cyan") {
      switch (type) {
        case "living":
          return "#0F2E4F";
        case "master_bed":
        case "bedroom":
          return "#102C4E";
        case "kitchen":
          return "#16385C";
        case "dining":
          return "#133458";
        case "bath":
          return "#103952";
        case "parking":
          return "#0D223B";
        case "courtyard":
        case "terrace":
        case "balcony":
          return "#143D4F";
        case "utility":
        case "foyer":
          return "#112B47";
        default:
          return "#0F2847";
      }
    }
    switch (type) {
      case "living":
        return "#EAE6DF";
      case "master_bed":
      case "bedroom":
        return "#F3EFEA";
      case "kitchen":
        return "#E5DFD5";
      case "dining":
        return "#ECE7DE";
      case "bath":
        return "#DEE6E8";
      case "parking":
        return "#DCD8CF";
      case "courtyard":
      case "terrace":
      case "balcony":
        return "#E1E8DC";
      case "utility":
      case "foyer":
        return "#EDE9E1";
      default:
        return "#F6F3ED";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[10000] bg-[#181614]/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fadeIn select-none ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div className="w-full max-w-7xl h-[95vh] bg-[#FAF8F5] border border-[rgba(28,24,20,0.18)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top CAD Header Bar */}
        <div className="px-5 py-3.5 bg-[#181614] text-white flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#B88555] flex items-center justify-center text-white font-bold text-sm">
              📐
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">{plan.name}</h3>
                <span className="text-[10px] font-mono uppercase bg-[#B88555]/30 text-amber-300 px-2 py-0.5 rounded border border-[#B88555]/50">
                  {plan.variation}
                </span>
                <span className="text-[10px] font-mono text-white/70">
                  {plan.plotSizeSqYd} sq yd ({plan.plotDimensions.lengthFt}&apos; × {plan.plotDimensions.widthFt}&apos;) • {plan.bhk} BHK • {plan.floors}
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono">
                CAD Scale: 1:100 (Architectural Vector) • Built-up: {activeFloor.builtUpAreaSqFt} sq ft • North: 000°
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {collaborators.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{collaborators.length} Live Peer{collaborators.length > 1 ? "s" : ""}</span>
              </div>
            )}

            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
              title="Copy real-time shareable plan link"
            >
              <span>{shareCopied ? "✓ Link Copied!" : "🔗 Share Link"}</span>
            </button>

            <button
              onClick={() => onOpen3DView(plan)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
            >
              <span>3D Visualization</span>
              <span>↗</span>
            </button>

            <button
              onClick={() => onRequestConsultation(plan)}
              className="px-4 py-1.5 rounded-xl bg-[#B88555] hover:bg-[#A07144] text-xs font-semibold text-white shadow-sm transition-all"
            >
              Request Consultation ↗
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors ml-2"
              title="Close Blueprint"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Floor Selection & CAD View Options Bar */}
        <div className="px-5 py-2.5 bg-[#EFECE6] border-b border-[rgba(28,24,20,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Floor Level Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[rgba(28,24,20,0.1)]">
            <span className="text-[10px] font-mono text-[#8E867B] uppercase px-2">Floor:</span>
            {plan.floorsData.map((f, idx) => (
              <button
                key={f.floorLevel}
                onClick={() => {
                  setActiveFloorIndex(idx);
                  resetView();
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeFloorIndex === idx
                    ? "bg-[#181614] text-white shadow-xs"
                    : "text-[#575149] hover:text-[#181614]"
                }`}
              >
                {f.floorLevel}
              </button>
            ))}
          </div>

          {/* Selected Room Real-Time Nudge Controls */}
          {selectedRoomId && (
            <div className="flex items-center gap-1.5 bg-[#181614] text-white px-3 py-1 rounded-xl text-xs shadow-xs border border-white/20">
              <span className="font-mono text-amber-300 text-[11px]">✦ Real-Time Move:</span>
              <button
                onClick={() => {
                  const r = activeFloor.rooms.find((rm) => rm.id === selectedRoomId);
                  if (r) handleNudgeRoom(selectedRoomId, roomOverrides[r.id]?.x ?? r.x, roomOverrides[r.id]?.y ?? r.y, -2, 0);
                }}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold"
                title="Move Left (Syncs live)"
              >
                ←
              </button>
              <button
                onClick={() => {
                  const r = activeFloor.rooms.find((rm) => rm.id === selectedRoomId);
                  if (r) handleNudgeRoom(selectedRoomId, roomOverrides[r.id]?.x ?? r.x, roomOverrides[r.id]?.y ?? r.y, 2, 0);
                }}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold"
                title="Move Right (Syncs live)"
              >
                →
              </button>
              <button
                onClick={() => {
                  const r = activeFloor.rooms.find((rm) => rm.id === selectedRoomId);
                  if (r) handleNudgeRoom(selectedRoomId, roomOverrides[r.id]?.x ?? r.x, roomOverrides[r.id]?.y ?? r.y, 0, -2);
                }}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold"
                title="Move Up (Syncs live)"
              >
                ↑
              </button>
              <button
                onClick={() => {
                  const r = activeFloor.rooms.find((rm) => rm.id === selectedRoomId);
                  if (r) handleNudgeRoom(selectedRoomId, roomOverrides[r.id]?.x ?? r.x, roomOverrides[r.id]?.y ?? r.y, 0, 2);
                }}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold"
                title="Move Down (Syncs live)"
              >
                ↓
              </button>
              <button
                onClick={() => setSelectedRoomId(null)}
                className="text-[10px] text-white/60 hover:text-white ml-1 font-mono"
              >
                ✕ Done
              </button>
            </div>
          )}

          {/* Toggle View Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                showDimensions
                  ? "bg-white text-[#181614] border-[#B88555]"
                  : "bg-transparent text-[#8E867B] border-[rgba(28,24,20,0.15)]"
              }`}
            >
              📏 Dimensions {showDimensions ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => setShowFurniture(!showFurniture)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                showFurniture
                  ? "bg-white text-[#181614] border-[#B88555]"
                  : "bg-transparent text-[#8E867B] border-[rgba(28,24,20,0.15)]"
              }`}
            >
              🛋 Furniture {showFurniture ? "ON" : "OFF"}
            </button>

            {/* Zoom & Canvas Controls */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[rgba(28,24,20,0.1)]">
              <button
                onClick={() => handleZoom(-0.2)}
                className="w-7 h-7 rounded-lg hover:bg-[#EFECE6] flex items-center justify-center font-bold text-sm"
                title="Zoom Out"
              >
                -
              </button>
              <span className="w-12 text-center font-mono text-[11px] font-semibold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.2)}
                className="w-7 h-7 rounded-lg hover:bg-[#EFECE6] flex items-center justify-center font-bold text-sm"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={resetView}
                className="px-2 py-1 text-[10px] font-mono text-[#575149] hover:text-[#181614]"
                title="Reset View"
              >
                Reset
              </button>
            </div>

            {/* Theme Toggle: Vellum / Cyan */}
            <button
              onClick={() => setTheme(theme === "cyan" ? "vellum" : "cyan")}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                theme === "cyan"
                  ? "bg-[#0B1E36] text-[#38BDF8] border-[#38BDF8] shadow-xs"
                  : "bg-white text-[#181614] border-[rgba(28,24,20,0.15)] hover:border-[#B88555]"
              }`}
              title="Switch blueprint theme between CAD Vellum and Classic Cyan"
            >
              <span>{theme === "cyan" ? "🔵 Cyan CAD" : "⚪ CAD Vellum"}</span>
            </button>

            {/* Prominent Download Blueprint as PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-[#B88555] hover:bg-[#A07144] disabled:opacity-60 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Download Vector A3 Landscape Architectural Blueprint PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print & Download SVG Buttons */}
            <button
              onClick={handleDownloadSVG}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] font-semibold text-xs text-[#181614] transition-colors"
              title="Download Vector SVG Blueprint"
            >
              📥 Download SVG
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] font-semibold text-xs text-[#181614] transition-colors"
              title="Print Architectural Drawing Sheet"
            >
              🖨 Print Sheet
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] text-xs text-[#181614]"
              title="Toggle Fullscreen"
            >
              ⛶
            </button>
          </div>
        </div>

        {/* CAD Canvas Area with Pan & Zoom */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 overflow-hidden relative flex items-center justify-center cursor-grab ${
            theme === "cyan" ? "bg-[#02131f]" : "bg-[#F7F4EE]"
          } ${isPanning ? "cursor-grabbing" : ""}`}
          style={{
            backgroundImage:
              theme === "cyan"
                ? `radial-gradient(rgba(56, 189, 248, 0.22) 1px, transparent 1px)`
                : `radial-gradient(rgba(28, 24, 20, 0.12) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        >
          {/* Floating Toast Notification */}
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#181614]/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/15 animate-fade-in pointer-events-none">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* North Direction Compass */}
          <div
            className={`absolute top-4 left-4 z-20 p-3 rounded-2xl border shadow-md pointer-events-none flex flex-col items-center gap-1 ${
              theme === "cyan"
                ? "bg-[#0b253a]/90 border-[#38bdf8]/30 text-[#e0f2fe]"
                : "bg-white/90 border-[rgba(28,24,20,0.15)] text-[#181614]"
            } backdrop-blur-md`}
          >
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center relative ${
                theme === "cyan" ? "border-[#38bdf8]/40" : "border-[rgba(28,24,20,0.2)]"
              }`}
            >
              <span className="font-mono font-bold text-[10px] text-rose-500 absolute -top-1">N</span>
              <div
                className={`w-0.5 h-6 rounded-full ${
                  theme === "cyan"
                    ? "bg-gradient-to-t from-[#38bdf8] to-rose-500"
                    : "bg-gradient-to-t from-[#181614] to-rose-600"
                }`}
              />
            </div>
            <span
              className={`text-[9px] font-mono uppercase tracking-widest font-bold ${
                theme === "cyan" ? "text-[#7dd3fc]" : "text-[#8E867B]"
              }`}
            >
              North
            </span>
          </div>

          {/* Scale & Room Legend Bar */}
          <div
            className={`absolute bottom-4 left-4 z-20 px-4 py-2 rounded-2xl border shadow-md pointer-events-none text-[11px] space-y-1 ${
              theme === "cyan"
                ? "bg-[#0b253a]/90 border-[#38bdf8]/30 text-[#e0f2fe]"
                : "bg-white/90 border-[rgba(28,24,20,0.15)] text-[#575149]"
            } backdrop-blur-md`}
          >
            <div className="flex items-center gap-3">
              <span className={`font-bold ${theme === "cyan" ? "text-white" : "text-[#181614]"}`}>
                {activeFloor.floorLevel}
              </span>
              <span>• Built-up: <strong>{activeFloor.builtUpAreaSqFt} sq.ft</strong></span>
              <span>• Carpet: <strong>{activeFloor.carpetAreaSqFt} sq.ft</strong></span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm border"
                  style={{
                    backgroundColor: getRoomColor("living"),
                    borderColor: theme === "cyan" ? "#38bdf8" : "rgba(28,24,20,0.2)",
                  }}
                />
                Living
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm border"
                  style={{
                    backgroundColor: getRoomColor("bedroom"),
                    borderColor: theme === "cyan" ? "#38bdf8" : "rgba(28,24,20,0.2)",
                  }}
                />
                Bedrooms
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm border"
                  style={{
                    backgroundColor: getRoomColor("kitchen"),
                    borderColor: theme === "cyan" ? "#38bdf8" : "rgba(28,24,20,0.2)",
                  }}
                />
                Kitchen
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm border"
                  style={{
                    backgroundColor: getRoomColor("bathroom"),
                    borderColor: theme === "cyan" ? "#38bdf8" : "rgba(28,24,20,0.2)",
                  }}
                />
                Bathrooms
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm border"
                  style={{
                    backgroundColor: getRoomColor("parking"),
                    borderColor: theme === "cyan" ? "#38bdf8" : "rgba(28,24,20,0.2)",
                  }}
                />
                Parking
              </span>
            </div>
          </div>

          {/* Interactive Transform Container */}
          <div
            id="blueprint-transform-container"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transition: isPanning ? "none" : "transform 0.15s ease-out",
            }}
            className={`w-[840px] h-[560px] p-6 shadow-2xl relative ${
              theme === "cyan"
                ? "bg-[#041c2c] border-2 border-[#38bdf8]"
                : "bg-white border-2 border-[#181614]"
            }`}
          >
            {/* Architectural Border & Title Block */}
            <div
              className={`absolute inset-2 border pointer-events-none ${
                theme === "cyan" ? "border-[#38bdf8]" : "border-[#181614]"
              }`}
            />
            <div
              className={`absolute inset-3 border border-dashed pointer-events-none ${
                theme === "cyan" ? "border-[#38bdf8]/40" : "border-[rgba(28,24,20,0.3)]"
              }`}
            />

            {/* Vector Blueprint Drawing */}
            <svg
              id="blueprint-canvas-svg"
              viewBox="0 0 800 520"
              className="w-full h-full"
            >
              <defs>
                {/* Wall Hatch Pattern */}
                <pattern id="wall-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke={theme === "cyan" ? "#38bdf8" : "#181614"}
                    strokeWidth="1.2"
                  />
                </pattern>
                {/* Tile Grid for Bath/Utility */}
                <pattern id="bath-tile" width="12" height="12" patternUnits="userSpaceOnUse">
                  <rect
                    width="12"
                    height="12"
                    fill={theme === "cyan" ? "#06283d" : "#DEE6E8"}
                    stroke={theme === "cyan" ? "#0284c7" : "#BDCCD0"}
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>

              {/* Setback dashed boundary */}
              <rect
                x="15"
                y="15"
                width="770"
                height="490"
                fill="none"
                stroke={theme === "cyan" ? "#38bdf8" : "#B88555"}
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />
              <text
                x="25"
                y="30"
                fill={theme === "cyan" ? "#38bdf8" : "#B88555"}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                PLOT BOUNDARY: {plan.plotDimensions.lengthFt}&apos;0&quot; × {plan.plotDimensions.widthFt}&apos;0&quot; ({plan.plotSizeSqYd} SQ. YDS)
              </text>

              {/* Rooms Generation */}
              {activeFloor.rooms.map((room) => {
                const curX = roomOverrides[room.id]?.x ?? room.x;
                const curY = roomOverrides[room.id]?.y ?? room.y;
                const rx = 35 + (curX / 100) * 730;
                const ry = 40 + (curY / 100) * 440;
                const rw = (room.w / 100) * 730;
                const rh = (room.h / 100) * 440;
                const color = getRoomColor(room.type);
                const isSelected = selectedRoomId === room.id;
                const wallColor = isSelected
                  ? "#f59e0b"
                  : theme === "cyan"
                  ? "#38bdf8"
                  : "#181614";
                const textColor = theme === "cyan" ? "#e0f2fe" : "#181614";
                const subtextColor = theme === "cyan" ? "#7dd3fc" : "#575149";
                const muteColor = theme === "cyan" ? "#38bdf8" : "#8E867B";

                return (
                  <g
                    key={room.id}
                    className="transition-all cursor-pointer hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoomId(isSelected ? null : room.id);
                    }}
                  >
                    {/* Room Wall Footprint */}
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill={color}
                      stroke={wallColor}
                      strokeWidth={isSelected ? "3.5" : "2.5"}
                    />

                    {/* Inner Accent Line */}
                    <rect
                      x={rx + 3}
                      y={ry + 3}
                      width={rw - 6}
                      height={rh - 6}
                      fill="none"
                      stroke={
                        isSelected
                          ? "rgba(245, 158, 11, 0.4)"
                          : theme === "cyan"
                          ? "rgba(56, 189, 248, 0.25)"
                          : "rgba(28,24,20,0.15)"
                      }
                      strokeWidth="0.8"
                    />

                    {/* Room Label & Dimensions */}
                    <text
                      x={rx + rw / 2}
                      y={ry + rh / 2 - 8}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="system-ui"
                    >
                      {room.name.toUpperCase()}
                    </text>

                    {showDimensions && (
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 + 8}
                        textAnchor="middle"
                        fill={subtextColor}
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {room.dimensions} ({room.areaSqFt} SQ FT)
                      </text>
                    )}

                    {/* Metric Sub-dimension */}
                    {showDimensions && (
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 + 20}
                        textAnchor="middle"
                        fill={muteColor}
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        [{room.metricDimensions}]
                      </text>
                    )}

                    {/* Furniture Icons Simulation */}
                    {showFurniture && room.furnitureIcons && (
                      <text
                        x={rx + 10}
                        y={ry + rh - 10}
                        fill={muteColor}
                        fontSize="8.5"
                        fontFamily="system-ui"
                      >
                        ✦ {room.furnitureIcons.join(" • ")}
                      </text>
                    )}

                    {/* Door Arc Simulation */}
                    <circle
                      cx={rx + 14}
                      cy={ry + 14}
                      r="12"
                      fill="none"
                      stroke={wallColor}
                      strokeWidth="1.2"
                      strokeDasharray="2,2"
                    />
                    <line
                      x1={rx}
                      y1={ry + 14}
                      x2={rx + 14}
                      y2={ry + 14}
                      stroke={wallColor}
                      strokeWidth="1.8"
                    />
                  </g>
                );
              })}

              {/* Staircase Steps */}
              {activeFloor.staircase.w > 0 && (
                <g>
                  {(() => {
                    const sx = 35 + (activeFloor.staircase.x / 100) * 730;
                    const sy = 40 + (activeFloor.staircase.y / 100) * 440;
                    const sw = (activeFloor.staircase.w / 100) * 730;
                    const sh = (activeFloor.staircase.h / 100) * 440;
                    const stepCount = 10;
                    const stepH = sh / stepCount;
                    const stairFill = theme === "cyan" ? "#062236" : "#ECE7DE";
                    const stairStroke = theme === "cyan" ? "#38bdf8" : "#181614";
                    const arrowColor = theme === "cyan" ? "#7dd3fc" : "#B88555";

                    return (
                      <g>
                        <rect x={sx} y={sy} width={sw} height={sh} fill={stairFill} stroke={stairStroke} strokeWidth="2.5" />
                        {Array.from({ length: stepCount }).map((_, i) => (
                          <line
                            key={`step-${i}`}
                            x1={sx}
                            y1={sy + i * stepH}
                            x2={sx + sw}
                            y2={sy + i * stepH}
                            stroke={stairStroke}
                            strokeWidth="1"
                          />
                        ))}
                        <line x1={sx + sw / 2} y1={sy} x2={sx + sw / 2} y2={sy + sh} stroke={arrowColor} strokeWidth="1.8" />
                        <text x={sx + sw / 2} y={sy + sh / 2} textAnchor="middle" fill={arrowColor} fontSize="10" fontWeight="bold" fontFamily="monospace">
                          {activeFloor.staircase.direction} ➔
                        </text>
                        <text x={sx + sw / 2} y={sy + 14} textAnchor="middle" fill={theme === "cyan" ? "#e0f2fe" : "#181614"} fontSize="8" fontWeight="bold" fontFamily="monospace">
                          STAIRS (18 RISERS)
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Bottom Title Block (Architectural Standard) */}
            <div
              className={`absolute bottom-3 left-3 right-3 border-t-2 pt-2 px-3 flex flex-wrap items-center justify-between text-[10px] font-mono ${
                theme === "cyan"
                  ? "bg-[#02131f] border-[#38bdf8] text-[#7dd3fc]"
                  : "bg-[#FAF8F5] border-[#181614] text-[#575149]"
              }`}
            >
              <div>
                <span className={`font-bold ${theme === "cyan" ? "text-white" : "text-[#181614]"}`}>
                  PROJECT: {plan.name.toUpperCase()}
                </span> •{" "}
                <span>VARIATION: {plan.variation}</span> •{" "}
                <span>STYLE: {plan.designStyle}</span>
              </div>
              <div>
                <span>VASTU: {plan.vastuScore}</span> •{" "}
                <span>CIRCULATION SCORE: {plan.circulationRating}/10</span> •{" "}
                <span>DWG NO: STHAVYA-2D-{plan.id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Architectural Disclaimer (Section 19) */}
        <div className="px-5 py-2.5 bg-amber-50/90 border-t border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2.5">
          <span className="text-amber-700 font-bold text-sm">⚠️</span>
          <p className="leading-snug">
            <strong>Architectural &amp; Regulatory Disclaimer:</strong> This floor plan represents a conceptual and preliminary design layout. Final construction blueprints, structural reinforcement calculations, ground setback clearances, FAR/FSI limits, and MEP schematics must be reviewed, stamped, and approved by a qualified licensed architect and civil engineer in accordance with applicable local building municipal regulations before execution.
          </p>
        </div>
      </div>
    </div>
  );
}
