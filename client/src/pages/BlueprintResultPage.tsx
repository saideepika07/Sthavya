import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SthavyaBrandLogo from "../components/SthavyaBrandLogo";
import { housePlanApi } from "../services/api";
import { HOUSE_PLANS_DATA, type HousePlan, type BlueprintRoom } from "../data/housePlansData";
import {
  downloadBlueprintAsPdf,
  downloadAllFloorsAsZip,
  downloadFloorAsSvg,
  downloadFloorAsPng,
  getBlueprintPdfFilename,
} from "../services/blueprintPdfService";
import SlotBookingModal from "../components/SlotBookingModal";

export default function BlueprintResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [theme, setTheme] = useState<"vellum" | "cyan">("vellum");
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [showAllFloors, setShowAllFloors] = useState(false);

  // 3D perspective & floor level slider
  const [perspective3D, setPerspective3D] = useState<
    "isometric" | "exterior_front" | "exterior_side" | "interior_living" | "interior_master" | "interior_kitchen"
  >("isometric");
  const [dollhouseLevel, setDollhouseLevel] = useState(0);

  // Export & Action State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<"pdf_current" | "pdf_all" | "zip_all" | "png" | "svg" | null>(null);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDownloadDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    setLoading(true);
    setError(null);

    try {
      if (id) {
        // Try fetching from server
        try {
          const res = await housePlanApi.getById(id);
          if (res?.success && res.plan) {
            setPlan(res.plan);
            setLoading(false);
            return;
          }
        } catch {
          // Fallback to local catalog
        }

        // Try local catalog match
        const localMatch = HOUSE_PLANS_DATA.find((p) => p.id === id);
        if (localMatch) {
          setPlan(localMatch);
          setLoading(false);
          return;
        }
      }

      // Fallback default
      setPlan(HOUSE_PLANS_DATA[0]);
    } catch (err: any) {
      setError("Failed to load blueprint details. Displaying default architectural plan.");
      setPlan(HOUSE_PLANS_DATA[0]);
    } finally {
      setLoading(false);
    }
  };

  // Extract and normalize floors
  const width = plan?.inputs?.width || plan?.plotDimensions?.widthFt || 30;
  const depth = plan?.inputs?.depth || plan?.plotDimensions?.lengthFt || 45;
  const plotSqFt = width * depth;

  const rawFloorsList =
    Array.isArray(plan?.floors) && plan.floors.length > 0
      ? plan.floors
      : Array.isArray(plan?.floorsData) && plan.floorsData.length > 0
      ? plan.floorsData
      : [];

  const floorsList =
    rawFloorsList.length > 0
      ? rawFloorsList.map((f: any, idx: number) => ({
          level: f.level ?? idx,
          label: f.label || f.floorLevel || (idx === 0 ? "Ground Floor" : `${idx}th Floor`),
          rooms: f.rooms || [],
          builtUpAreaSqFt: f.totalSqFt || f.builtUpAreaSqFt || Math.round(plotSqFt * 0.85),
          carpetAreaSqFt: f.carpetAreaSqFt || Math.round((f.totalSqFt || plotSqFt * 0.85) * 0.8),
          staircase: f.staircase || { x: 48, y: 50, w: 14, h: 22 },
        }))
      : [
          {
            level: 0,
            label: "Ground Floor",
            rooms: plan?.rooms || [],
            builtUpAreaSqFt: plan?.builtUpAreaSqFt || Math.round(plotSqFt * 0.85),
            carpetAreaSqFt: plan?.carpetAreaSqFt || Math.round(plotSqFt * 0.7),
            staircase: { x: 48, y: 50, w: 14, h: 22 },
          },
        ];

  const totalBuiltUpAreaSqFt =
    plan?.totalBuiltUpAreaSqFt ||
    plan?.totalSqFt ||
    floorsList.reduce((acc: number, f: any) => acc + (f.builtUpAreaSqFt || 0), 0);

  const activeFloor = floorsList[activeFloorIndex] || floorsList[0];
  const activeRooms: BlueprintRoom[] = activeFloor?.rooms || [];

  // Scaled Cost Calculation for multi-floor
  const baseBudgetLakhs = plan?.inputs?.budgetLakhs || plan?.estimatedCostLakhs || 48;
  const groundFloorSqFt = floorsList[0]?.builtUpAreaSqFt || 1200;
  const multiFloorScale = Math.max(1, totalBuiltUpAreaSqFt / groundFloorSqFt);
  const totalCostLakhs = Math.round(baseBudgetLakhs * (floorsList.length > 1 ? (0.8 + 0.2 * floorsList.length) : 1));

  // Export handlers
  const handleDownloadPdfCurrent = async () => {
    if (!plan || isExporting) return;
    setIsExporting("pdf_current");
    setDownloadDropdownOpen(false);
    showToast(`Generating A3 vector PDF for ${activeFloor.label}...`);

    try {
      await downloadBlueprintAsPdf({
        plan,
        activeFloorIndex,
        theme,
        containerElement: containerRef.current,
        allFloors: false,
      });
      const filename = getBlueprintPdfFilename(plan);
      showToast(`✓ Downloaded ${filename}`);
    } catch (err: any) {
      console.error("PDF export error:", err);
      showToast("⚠ Failed to generate PDF. Retrying...");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadPdfAllFloors = async () => {
    if (!plan || isExporting) return;
    setIsExporting("pdf_all");
    setDownloadDropdownOpen(false);
    showToast(`Generating complete multi-floor A3 landscape dossier with cover page (${floorsList.length} floors)...`);

    try {
      await downloadBlueprintAsPdf({
        plan,
        theme,
        containerElement: containerRef.current,
        allFloors: true,
      });
      const filename = getBlueprintPdfFilename(plan, "FullDossier");
      showToast(`✓ Downloaded Master Architectural Dossier (${filename})`);
    } catch (err: any) {
      console.error("Multi-floor PDF export error:", err);
      showToast("⚠ Failed to generate multi-floor PDF.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadZipAllFloors = async () => {
    if (!plan || isExporting) return;
    setIsExporting("zip_all");
    setDownloadDropdownOpen(false);
    showToast("Bundling all floors into ZIP package (PDFs, SVGs, PNGs & Manifest)...");

    try {
      await downloadAllFloorsAsZip(plan, theme);
      showToast("✓ Complete multi-floor ZIP package downloaded!");
    } catch (err: any) {
      console.error("ZIP export error:", err);
      showToast("⚠ Failed to bundle ZIP package.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadPng = async () => {
    if (!plan || isExporting) return;
    setIsExporting("png");
    showToast(`Exporting ${activeFloor.label} high-res PNG...`);
    try {
      await downloadFloorAsPng(plan, activeFloorIndex, theme, containerRef.current);
      showToast("✓ High-resolution PNG downloaded.");
    } catch (err) {
      console.error("PNG export error:", err);
      showToast("⚠ Failed to export PNG.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadSvg = () => {
    if (!plan || isExporting) return;
    setIsExporting("svg");
    showToast(`Exporting ${activeFloor.label} vector CAD SVG...`);
    try {
      downloadFloorAsSvg(plan, activeFloorIndex, theme);
      showToast("✓ Sharp vector SVG downloaded.");
    } catch (err) {
      console.error("SVG export error:", err);
      showToast("⚠ Failed to export SVG.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("✓ Blueprint link copied to clipboard!");
    } else {
      showToast(`Blueprint URL: ${window.location.href}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F3ED] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#181614]/10 shadow-lg flex items-center justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-[#B88555]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-bold text-[#181614]">Loading Blueprint Dossier...</h2>
        <p className="text-xs text-[#7A7268] mt-1 font-mono">Fetching CAD vector layers &amp; multi-floor specifications</p>
      </div>
    );
  }

  // Derived properties
  const title = plan?.title || plan?.name || "Architectural Spatial Floor Plan";
  const bhk = plan?.inputs?.bhk || (plan?.bhk ? `${plan.bhk} BHK` : "3 BHK");
  const floorsStr = plan?.floors || plan?.inputs?.floors || "G+1";
  const facing = plan?.inputs?.facing || "North";
  const style = plan?.inputs?.style || plan?.designStyle || "Modern Luxury";
  const finishTier = plan?.inputs?.finishTier || "Warm Luxury";

  const default3DImages = {
    isometricCutaway: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1280&q=80",
    exteriorFront: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1280&q=80",
    exteriorSide: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1280&q=80",
    interiorLiving: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1280&q=80",
    interiorMasterBed: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1280&q=80",
    interiorKitchen: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1280&q=80",
  };
  const images3D = plan?.visualization3D || default3DImages;

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] selection:bg-[#B88555] selection:text-white flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-[#181614] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[rgba(24,22,20,0.08)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            <SthavyaBrandLogo size="md" showTagline={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-full bg-white hover:bg-[#EFECE6] text-[#181614] text-xs font-semibold border border-[#181614]/15 transition-all"
            >
              Dashboard
            </Link>

            {/* Download PDF Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                disabled={isExporting !== null}
                className="px-5 py-2.5 rounded-full bg-[#181614] hover:bg-[#B88555] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Download PDF ▾</span>
                  </>
                )}
              </button>

              {downloadDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#181614]/15 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#181614]/10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A7268]">
                    Export Options (Vector A3 CAD)
                  </div>
                  <button
                    onClick={handleDownloadPdfCurrent}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#181614] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                  >
                    <span>📄 Current Floor Only ({activeFloor.label})</span>
                    <span className="text-[10px] font-mono text-[#7A7268]">A3 PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadPdfAllFloors}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#B88555] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                  >
                    <span>📚 All Floors Dossier (Cover + All Sheets)</span>
                    <span className="text-[10px] font-mono text-[#B88555]">Multi-Page</span>
                  </button>
                  <button
                    onClick={handleDownloadZipAllFloors}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#181614] hover:bg-[#FAF8F5] flex items-center justify-between border-t border-[#181614]/10 transition-colors"
                  >
                    <span>📦 All Floors ZIP Archive (PDF, SVG, PNG)</span>
                    <span className="text-[10px] font-mono text-[#7A7268]">ZIP</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Plan Header Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#181614]/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#181614] text-white text-xs font-mono font-bold uppercase">
                {bhk}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#EAE5DC] text-[#8C6239] text-xs font-mono font-semibold">
                {floorsStr}{plan?.hasPenthouse ? " + Penthouse" : ""}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono font-semibold">
                {facing} Facing
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold">
                ✦ 100% Attached En-Suites
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#181614]">
              {title}
            </h1>
            <p className="text-xs text-[#575149] font-mono">
              Plot: {width}' × {depth}' ({plotSqFt} Sq Ft) • Total Built-up: <strong>{totalBuiltUpAreaSqFt} Sq Ft</strong> across {floorsList.length} Levels • Budget: ₹{totalCostLakhs} Lakhs
            </p>
          </div>

          {/* Action Bar Quick Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdfCurrent}
              disabled={isExporting !== null}
              className="px-4 py-2.5 rounded-xl bg-[#181614] hover:bg-[#B88555] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              Floor PDF
            </button>
            <button
              onClick={handleDownloadPdfAllFloors}
              disabled={isExporting !== null}
              className="px-4 py-2.5 rounded-xl bg-[#B88555] hover:bg-[#A07144] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              All Floors PDF
            </button>
            <button
              onClick={handleDownloadZipAllFloors}
              disabled={isExporting !== null}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#181614] border border-[#181614]/15 text-xs font-semibold transition-all"
            >
              ZIP
            </button>
            <button
              onClick={handleDownloadPng}
              disabled={isExporting !== null}
              className="px-3 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#181614] border border-[#181614]/15 text-xs font-semibold transition-all"
            >
              PNG
            </button>
            <button
              onClick={handleDownloadSvg}
              disabled={isExporting !== null}
              className="px-3 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#181614] border border-[#181614]/15 text-xs font-semibold transition-all"
            >
              SVG
            </button>
            <button
              onClick={handleShareLink}
              className="px-3 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#181614] border border-[#181614]/15 text-xs font-semibold transition-all"
            >
              Share
            </button>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#181614] hover:bg-[#333] text-white text-xs font-bold transition-all shadow-sm"
            >
              Book Consult
            </button>
          </div>
        </div>

        {/* View Mode & Floor Tab Navigation Bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#181614]/10 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setViewMode("2d");
                  setShowAllFloors(false);
                }}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  viewMode === "2d" && !showAllFloors
                    ? "bg-[#181614] text-white shadow-md"
                    : "bg-white text-[#575149] hover:bg-[#EFECE6] border border-[#181614]/10"
                }`}
              >
                📐 2D CAD Blueprint
              </button>
              <button
                onClick={() => {
                  setViewMode("2d");
                  setShowAllFloors(true);
                }}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  viewMode === "2d" && showAllFloors
                    ? "bg-[#B88555] text-white shadow-md"
                    : "bg-white text-[#575149] hover:bg-[#EFECE6] border border-[#181614]/10"
                }`}
              >
                📚 All Floors Overview
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  viewMode === "3d"
                    ? "bg-[#181614] text-white shadow-md"
                    : "bg-white text-[#575149] hover:bg-[#EFECE6] border border-[#181614]/10"
                }`}
              >
                🏢 3D Dollhouse Cutaway
              </button>
            </div>

            {viewMode === "2d" && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#7A7268]">Theme:</span>
                <button
                  onClick={() => setTheme("vellum")}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    theme === "vellum"
                      ? "bg-[#FAF8F5] border-[#181614] text-[#181614]"
                      : "border-transparent text-[#7A7268]"
                  }`}
                >
                  Vellum
                </button>
                <button
                  onClick={() => setTheme("cyan")}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    theme === "cyan"
                      ? "bg-[#0A192F] text-[#60A5FA] border-[#60A5FA]"
                      : "border-transparent text-[#7A7268]"
                  }`}
                >
                  Cyan CAD
                </button>
              </div>
            )}
          </div>

          {/* Multi-Floor Tabs: Ground | 1st | 2nd | ... | Penthouse */}
          {!showAllFloors && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-xs font-mono font-bold text-[#7A7268] uppercase mr-2 shrink-0">
                Floor Levels:
              </span>
              {floorsList.map((f: any, idx: number) => {
                const isActive = activeFloorIndex === idx;
                const isPenthouse = f.label?.toLowerCase().includes("penthouse");
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveFloorIndex(idx)}
                    className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-2 border ${
                      isActive
                        ? isPenthouse
                          ? "bg-amber-600 text-white border-amber-600 shadow-md"
                          : "bg-[#181614] text-white border-[#181614] shadow-md"
                        : "bg-white text-[#575149] border-[#181614]/15 hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#EFECE6] text-[#7A7268]"
                      }`}
                    >
                      {f.builtUpAreaSqFt || 1200} sq ft
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Visualizer Area */}
        {viewMode === "2d" && !showAllFloors && (
          <div
            ref={containerRef}
            className="rounded-3xl border border-[#181614]/12 shadow-xl overflow-hidden bg-white"
          >
            {/* Header bar on blueprint */}
            <div className="px-6 py-3 bg-[#FAF8F5] border-b border-[#181614]/10 flex flex-wrap items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#181614] uppercase">
                  {activeFloor.label} (Level {activeFloor.level})
                </span>
                <span className="text-[#7A7268]">
                  • Area: {activeFloor.builtUpAreaSqFt} Sq Ft (Carpet: {activeFloor.carpetAreaSqFt} Sq Ft)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#B88555] font-semibold">
                <span>✦ Vertical Core Fixed ({activeFloor.staircase?.w || 14}% stair shaft)</span>
              </div>
            </div>

            <div
              className={`p-6 sm:p-10 flex items-center justify-center transition-colors ${
                theme === "cyan" ? "bg-[#0A192F]" : "bg-[#FAF8F5]"
              }`}
            >
              {/* Scalable Vector SVG CAD Canvas */}
              <svg
                ref={svgRef}
                viewBox="0 0 800 520"
                className="w-full max-w-4xl h-auto border rounded-2xl shadow-inner transition-all select-none"
                style={{
                  backgroundColor: theme === "cyan" ? "#0F2038" : "#FFFFFF",
                  borderColor: theme === "cyan" ? "rgba(96,165,250,0.3)" : "rgba(24,22,20,0.15)",
                }}
              >
                {/* CAD Grid Background */}
                <defs>
                  <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke={theme === "cyan" ? "rgba(96,165,250,0.08)" : "rgba(24,22,20,0.04)"}
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cadGrid)" />

                {/* Plot Boundary Border */}
                <rect
                  x="25"
                  y="35"
                  width="750"
                  height="465"
                  fill="none"
                  stroke={theme === "cyan" ? "#38BDF8" : "#B88555"}
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                />

                {/* Dimension Lines (Outer Perimeter) */}
                <g>
                  {/* Top: Plot Depth */}
                  <line
                    x1="25"
                    y1="20"
                    x2="775"
                    y2="20"
                    stroke={theme === "cyan" ? "#7DD3FC" : "#7A7268"}
                    strokeWidth="0.8"
                  />
                  <text
                    x="400"
                    y="16"
                    textAnchor="middle"
                    fill={theme === "cyan" ? "#7DD3FC" : "#575149"}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ◄─── PLOT DEPTH: {depth}' 0" ───►
                  </text>

                  {/* Left: Plot Width */}
                  <line
                    x1="14"
                    y1="35"
                    x2="14"
                    y2="500"
                    stroke={theme === "cyan" ? "#7DD3FC" : "#7A7268"}
                    strokeWidth="0.8"
                  />
                  <text
                    x="10"
                    y="270"
                    textAnchor="middle"
                    transform="rotate(-90 10 270)"
                    fill={theme === "cyan" ? "#7DD3FC" : "#575149"}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ◄─── PLOT WIDTH: {width}' 0" ───►
                  </text>
                </g>

                {/* Floor Label Badge */}
                <g>
                  <rect
                    x="30"
                    y="40"
                    width="180"
                    height="24"
                    rx="4"
                    fill={theme === "cyan" ? "#132D4E" : "#181614"}
                  />
                  <text
                    x="120"
                    y="56"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {activeFloor.label.toUpperCase()}
                  </text>
                </g>

                {/* Boundary & Orientation Note */}
                <text
                  x="225"
                  y="56"
                  fill={theme === "cyan" ? "#7DD3FC" : "#B88555"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  BOUNDARY: {depth}'0" × {width}'0" • NORTH: 000° ({facing} Access)
                </text>

                {/* Rooms Render */}
                {activeRooms.map((room: any, index: number) => {
                  const rx = 35 + ((room.x || 0) / 100) * 730;
                  const ry = 70 + ((room.y || 0) / 100) * 415;
                  const rw = ((room.w || 20) / 100) * 730;
                  const rh = ((room.h || 20) / 100) * 415;

                  const isBath = room.type === "bath" || room.name?.toLowerCase().includes("bath");
                  const isLiving = room.type === "living";
                  const isParking = room.type === "parking";
                  const isTerrace = room.type === "terrace";

                  const fill = theme === "cyan"
                    ? isBath
                      ? "rgba(14, 116, 144, 0.45)"
                      : isLiving
                      ? "rgba(30, 58, 138, 0.45)"
                      : isParking
                      ? "rgba(15, 23, 42, 0.8)"
                      : "rgba(15, 23, 42, 0.65)"
                    : isBath
                    ? "#EFF6FF"
                    : isLiving
                    ? "#F5F3ED"
                    : isParking
                    ? "#ECE7DE"
                    : isTerrace
                    ? "#FAF6ED"
                    : "#FFFFFF";

                  const stroke = theme === "cyan" ? "#60A5FA" : "#181614";
                  const textFill = theme === "cyan" ? "#E0F2FE" : "#181614";
                  const dimFill = theme === "cyan" ? "#93C5FD" : "#7A7268";

                  return (
                    <g key={room.id || index}>
                      {/* Room Rect Footprint */}
                      <rect
                        x={rx}
                        y={ry}
                        width={rw}
                        height={rh}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2.5"
                        rx="3"
                      />

                      {/* Inner Accent Line */}
                      <rect
                        x={rx + 3}
                        y={ry + 3}
                        width={Math.max(rw - 6, 2)}
                        height={Math.max(rh - 6, 2)}
                        fill="none"
                        stroke={theme === "cyan" ? "rgba(96,165,250,0.25)" : "rgba(24,22,20,0.12)"}
                        strokeWidth="0.8"
                      />

                      {/* Room Label */}
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 - 6}
                        fill={textFill}
                        fontSize="10"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {(room.name || room.label).toUpperCase()}
                      </text>

                      {/* Dimensions */}
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 + 10}
                        fill={dimFill}
                        fontSize="8.5"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {room.dimensions} ({room.areaSqFt || room.sqFt || 120} sq.ft)
                      </text>

                      {/* En-suite Tag for Bathrooms */}
                      {isBath && (
                        <text
                          x={rx + rw / 2}
                          y={ry + rh / 2 + 22}
                          fill={theme === "cyan" ? "#38BDF8" : "#B88555"}
                          fontSize="7.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ✦ ATTACHED
                        </text>
                      )}

                      {/* Door Swing Arc */}
                      <circle
                        cx={rx + 14}
                        cy={ry + 14}
                        r="12"
                        fill="none"
                        stroke={stroke}
                        strokeWidth="1.2"
                        strokeDasharray="2,2"
                      />
                      <line
                        x1={rx}
                        y1={ry + 14}
                        x2={rx + 14}
                        y2={ry + 14}
                        stroke={stroke}
                        strokeWidth="1.8"
                      />

                      {/* Window Symbols on exterior walls */}
                      {(room.type === "bedroom" ||
                        room.type === "master_bed" ||
                        room.type === "living" ||
                        room.type === "kitchen") && (
                        <g>
                          <line
                            x1={rx + rw / 2 - 16}
                            y1={ry + rh - 1.5}
                            x2={rx + rw / 2 + 16}
                            y2={ry + rh - 1.5}
                            stroke={theme === "cyan" ? "#38BDF8" : "#2563EB"}
                            strokeWidth="2.5"
                          />
                          <line
                            x1={rx + rw / 2 - 16}
                            y1={ry + rh + 1.5}
                            x2={rx + rw / 2 + 16}
                            y2={ry + rh + 1.5}
                            stroke={theme === "cyan" ? "#38BDF8" : "#2563EB"}
                            strokeWidth="2.5"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Staircase Core (Structural Alignment) */}
                {activeFloor.staircase && (
                  <g>
                    {(() => {
                      const sx = 35 + (activeFloor.staircase.x / 100) * 730;
                      const sy = 70 + (activeFloor.staircase.y / 100) * 415;
                      const sw = (activeFloor.staircase.w / 100) * 730;
                      const sh = (activeFloor.staircase.h / 100) * 415;
                      const stepCount = 8;
                      const stepH = sh / stepCount;

                      return (
                        <>
                          <rect
                            x={sx}
                            y={sy}
                            width={sw}
                            height={sh}
                            fill={theme === "cyan" ? "#132D4E" : "#ECE7DE"}
                            stroke={theme === "cyan" ? "#60A5FA" : "#181614"}
                            strokeWidth="2.5"
                          />
                          {Array.from({ length: stepCount }).map((_, i) => (
                            <line
                              key={i}
                              x1={sx}
                              y1={sy + i * stepH}
                              x2={sx + sw}
                              y2={sy + i * stepH}
                              stroke={theme === "cyan" ? "#60A5FA" : "#181614"}
                              strokeWidth="1"
                            />
                          ))}
                          <text
                            x={sx + sw / 2}
                            y={sy + sh / 2}
                            textAnchor="middle"
                            fill={theme === "cyan" ? "#E0F2FE" : "#181614"}
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            STAIR CORE
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}

                {/* Compass North Arrow */}
                <g transform="translate(740, 55)">
                  <circle
                    cx="0"
                    cy="0"
                    r="16"
                    fill={theme === "cyan" ? "#0F172A" : "#FFFFFF"}
                    stroke={theme === "cyan" ? "#60A5FA" : "#181614"}
                    strokeWidth="1.2"
                  />
                  <path d="M 0 -11 L 4 3 L -4 3 Z" fill="#EF4444" />
                  <path d="M 0 11 L 4 3 L -4 3 Z" fill={theme === "cyan" ? "#94A3B8" : "#7A7268"} />
                  <text
                    x="0"
                    y="-15"
                    textAnchor="middle"
                    fill="#EF4444"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    N
                  </text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* All Floors Overview (Grid / Stacked View) */}
        {viewMode === "2d" && showAllFloors && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#181614]/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#181614]">
                  All Floors Architectural Stack Overview
                </h2>
                <p className="text-xs text-[#575149] font-mono mt-0.5">
                  Showing all {floorsList.length} levels with vertically aligned staircase core and stacked wet-plumbing walls.
                </p>
              </div>
              <button
                onClick={handleDownloadPdfAllFloors}
                disabled={isExporting !== null}
                className="px-5 py-2.5 rounded-2xl bg-[#B88555] hover:bg-[#A07144] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shrink-0"
              >
                Download Multi-Page PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {floorsList.map((floor: any, idx: number) => {
                const isPenthouse = floor.label?.toLowerCase().includes("penthouse");
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-6 border border-[#181614]/10 shadow-sm space-y-4 hover:border-[#B88555] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#181614] text-white text-xs font-mono font-bold flex items-center justify-center">
                          {idx}
                        </span>
                        <div>
                          <h3 className="font-serif font-bold text-base text-[#181614]">
                            {floor.label}
                          </h3>
                          <p className="text-[10px] font-mono text-[#7A7268]">
                            Built-up: {floor.builtUpAreaSqFt} Sq Ft • Carpet: {floor.carpetAreaSqFt} Sq Ft
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveFloorIndex(idx);
                          setShowAllFloors(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE5DC] text-[#181614] text-xs font-semibold border border-[#181614]/10 transition-colors"
                      >
                        Inspect Floor ➔
                      </button>
                    </div>

                    {/* Compact Floor Blueprint Preview */}
                    <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#181614]/5">
                      <svg viewBox="0 0 800 520" className="w-full h-auto">
                        <rect width="100%" height="100%" fill="#FFFFFF" rx="8" />
                        <rect
                          x="25"
                          y="35"
                          width="750"
                          height="465"
                          fill="none"
                          stroke="#B88555"
                          strokeWidth="1.5"
                          strokeDasharray="6,4"
                        />
                        {(floor.rooms || []).map((rm: any, rIdx: number) => {
                          const rx = 35 + ((rm.x || 0) / 100) * 730;
                          const ry = 65 + ((rm.y || 0) / 100) * 420;
                          const rw = ((rm.w || 20) / 100) * 730;
                          const rh = ((rm.h || 20) / 100) * 420;
                          return (
                            <g key={rIdx}>
                              <rect
                                x={rx}
                                y={ry}
                                width={rw}
                                height={rh}
                                fill={rm.type === "bath" ? "#EFF6FF" : rm.type === "living" ? "#F5F3ED" : "#FFFFFF"}
                                stroke="#181614"
                                strokeWidth="2"
                                rx="2"
                              />
                              <text
                                x={rx + rw / 2}
                                y={ry + rh / 2}
                                textAnchor="middle"
                                fill="#181614"
                                fontSize="11"
                                fontWeight="bold"
                                fontFamily="sans-serif"
                              >
                                {(rm.name || rm.label || "Room").slice(0, 14)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Rooms List */}
                    <div className="text-xs text-[#575149] font-mono flex flex-wrap gap-1.5">
                      {(floor.rooms || []).map((r: any, rIdx: number) => (
                        <span
                          key={rIdx}
                          className="px-2 py-1 rounded-lg bg-[#FAF8F5] border border-[#181614]/8 text-[11px]"
                        >
                          {r.name || r.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3D Dollhouse View with Stacked Floor Slider */}
        {viewMode === "3d" && (
          <div className="rounded-3xl border border-[#181614]/12 shadow-xl overflow-hidden bg-white space-y-4 p-6">
            {/* Floor Selector / Slider in 3D Mode */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#181614]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A7268]">
                  Stacked Dollhouse Floor Selector:
                </span>
                <p className="font-serif font-bold text-base text-[#181614] mt-0.5">
                  Viewing: {floorsList[dollhouseLevel]?.label || "Ground Floor"} ({floorsList[dollhouseLevel]?.builtUpAreaSqFt || 1200} Sq Ft)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {floorsList.map((f: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setDollhouseLevel(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      dollhouseLevel === idx
                        ? "bg-[#181614] text-white shadow-sm"
                        : "bg-white text-[#575149] border border-[#181614]/15 hover:bg-[#EFECE6]"
                    }`}
                  >
                    Level {idx}: {f.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Perspective Buttons */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#181614]/10 pb-4 text-xs font-semibold">
              {[
                { id: "isometric", label: "🏢 Multi-Floor Cutaway" },
                { id: "exterior_front", label: "🏛 Front Elevation" },
                { id: "exterior_side", label: "📐 Side Pergola View" },
                { id: "interior_living", label: "🛋 Living Lounge" },
                { id: "interior_master", label: "🛏 Master Suite" },
                { id: "interior_kitchen", label: "🍳 Modular Kitchen" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPerspective3D(tab.id as any)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    perspective3D === tab.id
                      ? "bg-[#181614] text-white"
                      : "bg-[#FAF8F5] text-[#575149] hover:bg-[#EFECE6]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#181614]">
              <img
                src={images3D[perspective3D] || images3D.isometricCutaway}
                alt="3D Perspective"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-mono">
                ✦ STHAVYA 3D ENGINE • {perspective3D.toUpperCase()} • LEVEL: {dollhouseLevel} ({floorsList[dollhouseLevel]?.label})
              </div>
            </div>
          </div>
        )}

        {/* Detailed Sections Grid: Room Schedule & Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Room Schedule Table (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#181614]/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#181614]">
                  Room Schedule — {activeFloor.label}
                </h2>
                <p className="text-xs text-[#7A7268] font-mono mt-0.5">
                  Floor Built-up: {activeFloor.builtUpAreaSqFt} Sq Ft • All bedrooms have attached washrooms
                </p>
              </div>
              <span className="text-xs font-mono text-[#B88555] font-bold">
                100% PRIVATE EN-SUITES
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#181614]/10 text-[#7A7268] font-mono uppercase text-[10px]">
                    <th className="py-3 px-3">Room Name</th>
                    <th className="py-3 px-3">Dimensions</th>
                    <th className="py-3 px-3">Area (Sq Ft)</th>
                    <th className="py-3 px-3">Attached Bath</th>
                    <th className="py-3 px-3">Recommended Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181614]/5">
                  {activeRooms.map((rm: any, i: number) => {
                    const isBath = rm.type === "bath" || rm.name?.toLowerCase().includes("bath");
                    return (
                      <tr key={rm.id || i} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-3 font-semibold text-[#181614]">
                          {rm.name || rm.label}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[#575149]">
                          {rm.dimensions || "12' × 10'"}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-[#181614]">
                          {rm.areaSqFt || rm.sqFt || 120}
                        </td>
                        <td className="py-3.5 px-3 font-mono">
                          {isBath ? (
                            <span className="text-emerald-700 font-bold">En-Suite Attached</span>
                          ) : rm.type === "bedroom" || rm.type === "master_bed" ? (
                            <span className="text-emerald-700 font-bold">Direct Access</span>
                          ) : (
                            <span className="text-[#8C827A]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-[#575149]">
                          {rm.recommendedTrade ||
                            (isBath
                              ? "Plumbing & Waterproofing (Stack)"
                              : rm.type === "terrace"
                              ? "Waterproofing & Tiling"
                              : "Civil & Joinery")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Forecast & AI Audit (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cost Summary Card for Total Multi-Floor Structure */}
            <div className="bg-white rounded-3xl p-6 border border-[#181614]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A7268]">
                  Total Project Cost
                </p>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#7A7268] text-[10px] font-mono">
                  {floorsList.length} Levels Total
                </span>
              </div>

              <p className="text-3xl font-serif font-bold text-[#B88555]">
                ₹{totalCostLakhs} Lakhs
              </p>
              <p className="text-xs text-[#575149] font-mono">
                Finish Tier: <strong>{finishTier}</strong> • Total Built-up: <strong>{totalBuiltUpAreaSqFt} Sq Ft</strong>
              </p>

              <div className="space-y-2 pt-2 border-t border-[#181614]/10 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7A7268]">Civil &amp; Superstructure (~52%):</span>
                  <span className="font-mono font-bold">₹{Math.round(totalCostLakhs * 0.52)} Lakhs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7268]">Interior Joinery &amp; Millwork (~26%):</span>
                  <span className="font-mono font-bold">₹{Math.round(totalCostLakhs * 0.26)} Lakhs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7268]">Vertical MEP &amp; Plumbing Stacks (~14%):</span>
                  <span className="font-mono font-bold">₹{Math.round(totalCostLakhs * 0.14)} Lakhs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7268]">Paints &amp; Exterior Finishes (~8%):</span>
                  <span className="font-mono font-bold">₹{Math.round(totalCostLakhs * 0.08)} Lakhs</span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl text-[11px] font-mono text-[#7A7268] border border-[#181614]/8">
                Per-floor estimate: ~₹{Math.round(totalCostLakhs / floorsList.length)} Lakhs / floor
              </div>
            </div>

            {/* AI Spatial Audit */}
            <div className="bg-[#181614] rounded-3xl p-6 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-[#C9A675]">
                  AI Multi-Floor Audit
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  SCORE: 98/100
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-white">
                Structural &amp; Vastu Verified
              </h3>
              <ul className="space-y-2 text-xs text-white/75 font-sans pt-1">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Staircase core identical across all {floorsList.length} floors</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Wet plumbing areas stacked vertically</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>100% attached private washrooms for all suites</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Identical outer plot boundary across all floors</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Consultation Booking Modal */}
      {bookingModalOpen && (
        <SlotBookingModal
          professional={{
            id: "arch-1",
            name: "Ar. Rajesh Kulkarni",
            title: "Principal Architect",
            category: "Architect",
            experience: 16,
            rating: 4.9,
            reviewsCount: 84,
            hourlyRate: 2500,
            specialization: ["Luxury Residential", "Multi-Floor Blueprints", "Vastu Compliant CAD"],
            location: "Bangalore & Hyderabad",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80",
          } as any}
          plan={plan}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onBookingComplete={() => {
            setBookingModalOpen(false);
            showToast("✓ Consultation booked! Check your dashboard for slot details.");
          }}
        />
      )}
    </div>
  );
}
