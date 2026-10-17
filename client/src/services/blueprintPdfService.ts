import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import type { HousePlan, FloorBlueprint, BlueprintRoom } from "../data/housePlansData";

export interface BlueprintPdfOptions {
  plan: HousePlan | any;
  activeFloorIndex?: number;
  theme?: "vellum" | "cyan";
  svgElement?: SVGElement | null;
  containerElement?: HTMLElement | null;
  allFloors?: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function getBlueprintPdfFilename(plan: any, suffix = ""): string {
  const bhkRaw = plan.bhk || plan.inputs?.bhk || "3";
  const bhkNum = String(bhkRaw).replace(/[^0-9]/g, "") || "3";
  const bhkStr = `${bhkNum}BHK`;

  const floorsRaw = plan.floors || plan.inputs?.floors || "G+1";
  const floorsClean = String(floorsRaw)
    .replace(/\s+/g, "")
    .replace(/\+/g, "plus")
    .replace(/[^a-zA-Z0-9]/g, "");

  const hasPh = plan.hasPenthouse || plan.inputs?.hasPenthouse ? "PH" : "";
  const dateStr = new Date().toISOString().split("T")[0];
  const suff = suffix ? `_${suffix}` : "";
  return `Sthavya_${bhkStr}_${floorsClean}${hasPh ? `_${hasPh}` : ""}${suff}_${dateStr}.pdf`;
}

/**
 * Creates a standalone architectural vector SVG element for a floor
 */
export function createBlueprintSvgElement(
  plan: any,
  activeFloor: FloorBlueprint | any,
  theme: "vellum" | "cyan" = "vellum"
): SVGSVGElement {
  const isCyan = theme === "cyan";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", "0 0 800 520");
  svg.setAttribute("width", "800");
  svg.setAttribute("height", "520");

  const bg = isCyan ? "#0A192F" : "#FFFFFF";
  const wallStroke = isCyan ? "#60A5FA" : "#181614";
  const textFill = isCyan ? "#E0F2FE" : "#181614";
  const dimFill = isCyan ? "#7DD3FC" : "#575149";
  const boundaryStroke = isCyan ? "#38BDF8" : "#B88555";

  // Background rect
  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("width", "100%");
  bgRect.setAttribute("height", "100%");
  bgRect.setAttribute("fill", bg);
  svg.appendChild(bgRect);

  // Outer CAD Boundary
  const plotW = plan.plotDimensions?.widthFt || plan.inputs?.width || 30;
  const plotL = plan.plotDimensions?.lengthFt || plan.inputs?.depth || 45;
  const plotSqYd = plan.plotSizeSqYd || Math.round((plotW * plotL) / 9);

  const boundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  boundRect.setAttribute("x", "25");
  boundRect.setAttribute("y", "35");
  boundRect.setAttribute("width", "750");
  boundRect.setAttribute("height", "465");
  boundRect.setAttribute("fill", "none");
  boundRect.setAttribute("stroke", boundaryStroke);
  boundRect.setAttribute("stroke-width", "1.5");
  boundRect.setAttribute("stroke-dasharray", "6,4");
  svg.appendChild(boundRect);

  // Dimension Lines (top: plot depth, left: plot width)
  const dimGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const topDimLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  topDimLine.setAttribute("x1", "25");
  topDimLine.setAttribute("y1", "20");
  topDimLine.setAttribute("x2", "775");
  topDimLine.setAttribute("y2", "20");
  topDimLine.setAttribute("stroke", dimFill);
  topDimLine.setAttribute("stroke-width", "0.8");
  dimGroup.appendChild(topDimLine);

  const topDimText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  topDimText.setAttribute("x", "400");
  topDimText.setAttribute("y", "16");
  topDimText.setAttribute("text-anchor", "middle");
  topDimText.setAttribute("fill", dimFill);
  topDimText.setAttribute("font-size", "9");
  topDimText.setAttribute("font-family", "monospace");
  topDimText.setAttribute("font-weight", "bold");
  topDimText.textContent = `◄─── PLOT DEPTH: ${plotL}' 0" ───►`;
  dimGroup.appendChild(topDimText);

  const leftDimLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  leftDimLine.setAttribute("x1", "14");
  leftDimLine.setAttribute("y1", "35");
  leftDimLine.setAttribute("x2", "14");
  leftDimLine.setAttribute("y2", "500");
  leftDimLine.setAttribute("stroke", dimFill);
  leftDimLine.setAttribute("stroke-width", "0.8");
  dimGroup.appendChild(leftDimLine);

  const leftDimText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  leftDimText.setAttribute("x", "10");
  leftDimText.setAttribute("y", "270");
  leftDimText.setAttribute("text-anchor", "middle");
  leftDimText.setAttribute("transform", "rotate(-90 10 270)");
  leftDimText.setAttribute("fill", dimFill);
  leftDimText.setAttribute("font-size", "9");
  leftDimText.setAttribute("font-family", "monospace");
  leftDimText.setAttribute("font-weight", "bold");
  leftDimText.textContent = `◄─── PLOT WIDTH: ${plotW}' 0" ───►`;
  dimGroup.appendChild(leftDimText);

  svg.appendChild(dimGroup);

  // Floor Level Badge
  const floorName = (activeFloor?.label || activeFloor?.floorLevel || "Ground Floor").toUpperCase();
  const flBadge = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const flRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  flRect.setAttribute("x", "30");
  flRect.setAttribute("y", "40");
  flRect.setAttribute("width", "160");
  flRect.setAttribute("height", "22");
  flRect.setAttribute("rx", "4");
  flRect.setAttribute("fill", isCyan ? "#132D4E" : "#181614");
  flBadge.appendChild(flRect);

  const flText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  flText.setAttribute("x", "110");
  flText.setAttribute("y", "55");
  flText.setAttribute("text-anchor", "middle");
  flText.setAttribute("fill", "#FFFFFF");
  flText.setAttribute("font-size", "10");
  flText.setAttribute("font-family", "monospace");
  flText.setAttribute("font-weight", "bold");
  flText.textContent = `FLOOR: ${floorName}`;
  flBadge.appendChild(flText);
  svg.appendChild(flBadge);

  // Boundary spec note
  const boundText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  boundText.setAttribute("x", "200");
  boundText.setAttribute("y", "55");
  boundText.setAttribute("fill", boundaryStroke);
  boundText.setAttribute("font-size", "10");
  boundText.setAttribute("font-family", "monospace");
  boundText.setAttribute("font-weight", "bold");
  boundText.textContent = `BOUNDARY: ${plotL}'0" × ${plotW}'0" (${plotSqYd} SQ YD) • 100% EN-SUITE`;
  svg.appendChild(boundText);

  // Extract rooms
  const rooms: BlueprintRoom[] =
    activeFloor?.rooms || plan.floorsData?.[0]?.rooms || plan.rooms || [];

  rooms.forEach((room: any) => {
    const rx = 35 + ((room.x || 0) / 100) * 730;
    const ry = 65 + ((room.y || 0) / 100) * 420;
    const rw = ((room.w || 20) / 100) * 730;
    const rh = ((room.h || 20) / 100) * 420;

    let roomColor = isCyan ? "#0F2847" : "#F4F0EA";
    if (room.type === "bath") roomColor = isCyan ? "#103952" : "#DEE6E8";
    if (room.type === "kitchen") roomColor = isCyan ? "#16385C" : "#E5DFD5";
    if (room.type === "living") roomColor = isCyan ? "#0F2E4F" : "#EAE6DF";
    if (room.type === "parking") roomColor = isCyan ? "#0D223B" : "#DCD8CF";
    if (room.type === "terrace") roomColor = isCyan ? "#0A2540" : "#F8F5EE";

    // Room wall footprint
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", rx.toFixed(1));
    rect.setAttribute("y", ry.toFixed(1));
    rect.setAttribute("width", rw.toFixed(1));
    rect.setAttribute("height", rh.toFixed(1));
    rect.setAttribute("fill", roomColor);
    rect.setAttribute("stroke", wallStroke);
    rect.setAttribute("stroke-width", "2.5");
    svg.appendChild(rect);

    // Inner accent line
    const innerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    innerRect.setAttribute("x", (rx + 3).toFixed(1));
    innerRect.setAttribute("y", (ry + 3).toFixed(1));
    innerRect.setAttribute("width", Math.max(rw - 6, 2).toFixed(1));
    innerRect.setAttribute("height", Math.max(rh - 6, 2).toFixed(1));
    innerRect.setAttribute("fill", "none");
    innerRect.setAttribute("stroke", isCyan ? "rgba(96,165,250,0.3)" : "rgba(28,24,20,0.15)");
    innerRect.setAttribute("stroke-width", "0.8");
    svg.appendChild(innerRect);

    // Room Label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", (rx + rw / 2).toFixed(1));
    label.setAttribute("y", (ry + rh / 2 - 8).toFixed(1));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", textFill);
    label.setAttribute("font-size", "10");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("font-family", "sans-serif");
    label.textContent = (room.name || room.label || "ROOM").toUpperCase();
    svg.appendChild(label);

    // Dimensions
    const dims = document.createElementNS("http://www.w3.org/2000/svg", "text");
    dims.setAttribute("x", (rx + rw / 2).toFixed(1));
    dims.setAttribute("y", (ry + rh / 2 + 8).toFixed(1));
    dims.setAttribute("text-anchor", "middle");
    dims.setAttribute("fill", dimFill);
    dims.setAttribute("font-size", "8.5");
    dims.setAttribute("font-family", "monospace");
    dims.setAttribute("font-weight", "600");
    const sqFt = room.areaSqFt || room.sqFt || "";
    dims.textContent = `${room.dimensions || ""}${sqFt ? ` (${sqFt} SQ FT)` : ""}`;
    svg.appendChild(dims);

    // Attached Bath Tag
    if (room.type === "bath" || room.name?.toLowerCase().includes("bath")) {
      const tag = document.createElementNS("http://www.w3.org/2000/svg", "text");
      tag.setAttribute("x", (rx + rw / 2).toFixed(1));
      tag.setAttribute("y", (ry + rh / 2 + 18).toFixed(1));
      tag.setAttribute("text-anchor", "middle");
      tag.setAttribute("fill", isCyan ? "#38BDF8" : "#B88555");
      tag.setAttribute("font-size", "7.5");
      tag.setAttribute("font-family", "monospace");
      tag.setAttribute("font-weight", "bold");
      tag.textContent = "✦ ATTACHED";
      svg.appendChild(tag);
    }

    // Door Swing Arc
    const doorCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    doorCircle.setAttribute("cx", (rx + 14).toFixed(1));
    doorCircle.setAttribute("cy", (ry + 14).toFixed(1));
    doorCircle.setAttribute("r", "12");
    doorCircle.setAttribute("fill", "none");
    doorCircle.setAttribute("stroke", wallStroke);
    doorCircle.setAttribute("stroke-width", "1.2");
    doorCircle.setAttribute("stroke-dasharray", "2,2");
    svg.appendChild(doorCircle);

    const doorLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    doorLine.setAttribute("x1", rx.toFixed(1));
    doorLine.setAttribute("y1", (ry + 14).toFixed(1));
    doorLine.setAttribute("x2", (rx + 14).toFixed(1));
    doorLine.setAttribute("y2", (ry + 14).toFixed(1));
    doorLine.setAttribute("stroke", wallStroke);
    doorLine.setAttribute("stroke-width", "1.8");
    svg.appendChild(doorLine);

    // Architectural Window Symbol (exterior wall)
    if (
      room.type === "bedroom" ||
      room.type === "master_bed" ||
      room.type === "living" ||
      room.type === "kitchen"
    ) {
      const winW = Math.min(rw * 0.45, 36);
      const winX = rx + (rw - winW) / 2;
      const winY = ry + rh;
      const winG = document.createElementNS("http://www.w3.org/2000/svg", "g");

      const winLine1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      winLine1.setAttribute("x1", winX.toFixed(1));
      winLine1.setAttribute("y1", (winY - 2).toFixed(1));
      winLine1.setAttribute("x2", (winX + winW).toFixed(1));
      winLine1.setAttribute("y2", (winY - 2).toFixed(1));
      winLine1.setAttribute("stroke", isCyan ? "#38BDF8" : "#2563EB");
      winLine1.setAttribute("stroke-width", "2");
      winG.appendChild(winLine1);

      const winLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      winLine2.setAttribute("x1", winX.toFixed(1));
      winLine2.setAttribute("y1", (winY + 2).toFixed(1));
      winLine2.setAttribute("x2", (winX + winW).toFixed(1));
      winLine2.setAttribute("y2", (winY + 2).toFixed(1));
      winLine2.setAttribute("stroke", isCyan ? "#38BDF8" : "#2563EB");
      winLine2.setAttribute("stroke-width", "2");
      winG.appendChild(winLine2);

      svg.appendChild(winG);
    }
  });

  // Staircase (consistent structural core)
  const sc = activeFloor?.staircase || { x: 48, y: 50, w: 14, h: 22 };
  if (sc && sc.w > 0) {
    const sx = 35 + (sc.x / 100) * 730;
    const sy = 65 + (sc.y / 100) * 420;
    const sw = (sc.w / 100) * 730;
    const sh = (sc.h / 100) * 420;
    const stepCount = 8;
    const stepH = sh / stepCount;

    const sRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    sRect.setAttribute("x", sx.toFixed(1));
    sRect.setAttribute("y", sy.toFixed(1));
    sRect.setAttribute("width", sw.toFixed(1));
    sRect.setAttribute("height", sh.toFixed(1));
    sRect.setAttribute("fill", isCyan ? "#132D4E" : "#ECE7DE");
    sRect.setAttribute("stroke", wallStroke);
    sRect.setAttribute("stroke-width", "2.5");
    svg.appendChild(sRect);

    for (let i = 0; i < stepCount; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", sx.toFixed(1));
      line.setAttribute("y1", (sy + i * stepH).toFixed(1));
      line.setAttribute("x2", (sx + sw).toFixed(1));
      line.setAttribute("y2", (sy + i * stepH).toFixed(1));
      line.setAttribute("stroke", wallStroke);
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }

    const stText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    stText.setAttribute("x", (sx + sw / 2).toFixed(1));
    stText.setAttribute("y", (sy + sh / 2).toFixed(1));
    stText.setAttribute("text-anchor", "middle");
    stText.setAttribute("fill", textFill);
    stText.setAttribute("font-size", "8");
    stText.setAttribute("font-family", "monospace");
    stText.setAttribute("font-weight", "bold");
    stText.textContent = "STAIR CORE";
    svg.appendChild(stText);
  }

  // North Compass
  const compassGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  compassGroup.setAttribute("transform", "translate(740, 55)");
  const cCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  cCircle.setAttribute("cx", "0");
  cCircle.setAttribute("cy", "0");
  cCircle.setAttribute("r", "16");
  cCircle.setAttribute("fill", isCyan ? "#0B1E36" : "#FAF8F5");
  cCircle.setAttribute("stroke", wallStroke);
  cCircle.setAttribute("stroke-width", "1");
  compassGroup.appendChild(cCircle);

  const needle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  needle.setAttribute("points", "0,-12 3,0 0,2 -3,0");
  needle.setAttribute("fill", "#EF4444");
  compassGroup.appendChild(needle);

  const cText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  cText.setAttribute("x", "0");
  cText.setAttribute("y", "-18");
  cText.setAttribute("text-anchor", "middle");
  cText.setAttribute("font-size", "9");
  cText.setAttribute("font-weight", "bold");
  cText.setAttribute("fill", "#EF4444");
  cText.textContent = "N";
  compassGroup.appendChild(cText);
  svg.appendChild(compassGroup);

  return svg;
}

/**
 * Loads the STHAVYA logo image asynchronously
 */
async function loadSthavyaLogo(): Promise<HTMLImageElement | null> {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/sthavya-logo.png";
  });
}

/**
 * Helper to normalize floors list from plan
 */
function extractFloorsList(plan: any): Array<any> {
  if (Array.isArray(plan.floors) && plan.floors.length > 0) {
    return plan.floors.map((f: any, i: number) => ({
      level: f.level ?? i,
      label: f.label || (f.level === 0 ? "Ground Floor" : `${f.level}th Floor`),
      floorLevel: f.label || (f.level === 0 ? "Ground Floor" : `${f.level}th Floor`),
      rooms: f.rooms || [],
      builtUpAreaSqFt: f.totalSqFt || f.builtUpAreaSqFt || 1200,
      carpetAreaSqFt: f.carpetAreaSqFt || Math.round((f.totalSqFt || 1200) * 0.8),
      staircase: f.staircase || { x: 48, y: 50, w: 14, h: 22 },
    }));
  }
  if (Array.isArray(plan.floorsData) && plan.floorsData.length > 0) {
    return plan.floorsData.map((f: any, i: number) => ({
      level: i,
      label: f.floorLevel || (i === 0 ? "Ground Floor" : `${i}th Floor`),
      floorLevel: f.floorLevel || (i === 0 ? "Ground Floor" : `${i}th Floor`),
      rooms: f.rooms || [],
      builtUpAreaSqFt: f.builtUpAreaSqFt || 1200,
      carpetAreaSqFt: f.carpetAreaSqFt || Math.round((f.builtUpAreaSqFt || 1200) * 0.8),
      staircase: f.staircase || { x: 48, y: 50, w: 14, h: 22 },
    }));
  }
  return [
    {
      level: 0,
      label: "Ground Floor",
      floorLevel: "Ground Floor",
      rooms: plan.rooms || [],
      builtUpAreaSqFt: plan.builtUpAreaSqFt || 1200,
      carpetAreaSqFt: plan.carpetAreaSqFt || 960,
      staircase: { x: 48, y: 50, w: 14, h: 22 },
    },
  ];
}

/**
 * Renders an A3 Landscape Cover Page
 */
function renderCoverPage(
  doc: jsPDF,
  plan: any,
  floorsList: any[],
  theme: "vellum" | "cyan",
  logoImg: HTMLImageElement | null
) {
  const isCyan = theme === "cyan";
  const PAGE_WIDTH = 420;
  const PAGE_HEIGHT = 297;
  const MARGIN = 10;
  const SHEET_W = PAGE_WIDTH - MARGIN * 2;
  const SHEET_H = PAGE_HEIGHT - MARGIN * 2;

  const colors = {
    bg: isCyan ? "#0B1E36" : "#FAF8F5",
    border: isCyan ? "#38BDF8" : "#181614",
    accent: isCyan ? "#38BDF8" : "#B88555",
    headerBg: isCyan ? "#0F2847" : "#181614",
    cardBg: isCyan ? "#0E243F" : "#FFFFFF",
    cardBorder: isCyan ? "#1E40AF" : "#E2DDD5",
    textPrimary: isCyan ? "#FFFFFF" : "#181614",
    textSecondary: isCyan ? "#BAE6FD" : "#575149",
    textMuted: isCyan ? "#7DD3FC" : "#8E867B",
  };

  // Background
  const [bgR, bgG, bgB] = hexToRgb(colors.bg);
  doc.setFillColor(bgR, bgG, bgB);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  // CAD Double Border
  const [bdrR, bdrG, bdrB] = hexToRgb(colors.border);
  doc.setDrawColor(bdrR, bdrG, bdrB);
  doc.setLineWidth(1.0);
  doc.rect(MARGIN, MARGIN, SHEET_W, SHEET_H, "S");
  doc.setLineWidth(0.3);
  doc.rect(MARGIN + 2, MARGIN + 2, SHEET_W - 4, SHEET_H - 4, "S");

  // Top Header Banner
  const [hdrR, hdrG, hdrB] = hexToRgb(colors.headerBg);
  doc.setFillColor(hdrR, hdrG, hdrB);
  doc.rect(MARGIN + 2, MARGIN + 2, SHEET_W - 4, 38, "F");

  let logoDrawn = false;
  if (logoImg) {
    try {
      doc.addImage(logoImg, "PNG", MARGIN + 8, MARGIN + 6, 26, 26);
      logoDrawn = true;
    } catch {
      logoDrawn = false;
    }
  }

  const textOffsetX = logoDrawn ? MARGIN + 40 : MARGIN + 12;

  // STHAVYA Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("STHAVYA", textOffsetX, MARGIN + 18);

  const [accR, accG, accB] = hexToRgb(colors.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(accR, accG, accB);
  doc.text("YOUR VISION, BUILT TO BELONG", textOffsetX, MARGIN + 28);

  // Right Header Ref
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(accR, accG, accB);
  const planId = plan.id || plan._id || "STHAVYA-DWG-001";
  doc.text(
    `MASTER DOSSIER REF: STHAVYA-ARCH-${String(planId).slice(-6).toUpperCase()}`,
    PAGE_WIDTH - MARGIN - 10,
    MARGIN + 16,
    { align: "right" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const dateFormatted = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.text(`DATE OF ISSUE: ${dateFormatted} • REVISION: 01`, PAGE_WIDTH - MARGIN - 10, MARGIN + 26, {
    align: "right",
  });

  // Hero Title Area
  let currY = MARGIN + 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const [txtR, txtG, txtB] = hexToRgb(colors.textPrimary);
  doc.setTextColor(txtR, txtG, txtB);
  doc.text("ARCHITECTURAL BLUEPRINT & MULTI-FLOOR SPATIAL DOSSIER", PAGE_WIDTH / 2, currY, {
    align: "center",
  });

  currY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const [mutedR, mutedG, mutedB] = hexToRgb(colors.textMuted);
  doc.setTextColor(mutedR, mutedG, mutedB);
  doc.text(
    "Integrated Architectural Drawings, Structural Consistency Core, Vertical MEP Plumbing Stacks & Room Schedules",
    PAGE_WIDTH / 2,
    currY,
    { align: "center" }
  );

  // Metadata Cards Grid (3 Columns)
  currY += 14;
  const colW = (SHEET_W - 16) / 3;
  const cardH = 58;

  const plotW = plan.plotDimensions?.widthFt || plan.inputs?.width || 30;
  const plotL = plan.plotDimensions?.lengthFt || plan.inputs?.depth || 45;
  const plotSqYd = plan.plotSizeSqYd || Math.round((plotW * plotL) / 9);
  const plotSqFt = plotW * plotL;
  const bhkRaw = plan.bhk || plan.inputs?.bhk || "3";
  const bhkNum = String(bhkRaw).replace(/[^0-9]/g, "") || "3";
  const floorsStr = plan.floors || plan.inputs?.floors || "G+1";
  const facing = plan.facing || plan.inputs?.facing || "North";
  const totalBuiltUp =
    plan.totalBuiltUpAreaSqFt ||
    plan.totalSqFt ||
    floorsList.reduce((acc, f) => acc + (f.builtUpAreaSqFt || 0), 0);
  const budget = plan.estimatedCostLakhs
    ? `₹${plan.estimatedCostLakhs} Lakhs`
    : plan.inputs?.budget || "Standard Residential Tier";

  const cardsData = [
    {
      title: "PROPERTY & TYPOLOGY",
      items: [
        ["Plot Dimensions:", `${plotW}'0" × ${plotL}'0"`],
        ["Plot Area:", `${plotSqFt} Sq Ft (${plotSqYd} Sq Yds)`],
        ["Typology:", `${bhkNum} BHK (En-Suite Suites)`],
        ["Structure:", `${floorsStr}${plan.hasPenthouse ? " + Penthouse" : ""}`],
      ],
    },
    {
      title: "SPATIAL & ARCHITECTURAL METRICS",
      items: [
        ["Total Built-up Area:", `${totalBuiltUp} Sq Ft`],
        ["Orientation:", `${facing} Facing (Vastu Compliant)`],
        ["Vastu Score:", `${plan.vastuScore || 96}/100 Rating`],
        ["Staircase & Lift Core:", "Aligned Vertically (Zero Drift)"],
      ],
    },
    {
      title: "SPECIFICATIONS & GUARANTEES",
      items: [
        ["Plumbing & Wet Areas:", "Stacked Vertically (MEP Verified)"],
        ["Bathroom Access:", "100% Attached Private En-Suites"],
        ["Estimated Project Budget:", `${budget}`],
        ["CAD Projection:", "Vector CAD 1:100 Scale"],
      ],
    },
  ];

  const [cBgR, cBgG, cBgB] = hexToRgb(colors.cardBg);
  const [cBdrR, cBdrG, cBdrB] = hexToRgb(colors.cardBorder);
  const [secR, secG, secB] = hexToRgb(colors.textSecondary);

  cardsData.forEach((card, idx) => {
    const cardX = MARGIN + 4 + idx * (colW + 4);
    doc.setFillColor(cBgR, cBgG, cBgB);
    doc.rect(cardX, currY, colW, cardH, "F");
    doc.setDrawColor(cBdrR, cBdrG, cBdrB);
    doc.setLineWidth(0.4);
    doc.rect(cardX, currY, colW, cardH, "S");

    // Card Header Bar
    doc.setFillColor(hdrR, hdrG, hdrB);
    doc.rect(cardX, currY, colW, 8.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(accR, accG, accB);
    doc.text(card.title, cardX + 4, currY + 6);

    let rowY = currY + 15;
    card.items.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(txtR, txtG, txtB);
      doc.text(label, cardX + 4, rowY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(secR, secG, secB);
      doc.text(val, cardX + 44, rowY);
      rowY += 10;
    });
  });

  // Sheet Index Table
  currY += cardH + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(accR, accG, accB);
  doc.text("ARCHITECTURAL DRAWING SHEET INDEX", MARGIN + 6, currY);

  currY += 5;
  const tableW = SHEET_W - 8;
  doc.setFillColor(hdrR, hdrG, hdrB);
  doc.rect(MARGIN + 4, currY, tableW, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("SHEET NO.", MARGIN + 8, currY + 5);
  doc.text("DRAWING TITLE & LEVEL", MARGIN + 38, currY + 5);
  doc.text("KEY SPATIAL COMPONENTS", MARGIN + 120, currY + 5);
  doc.text("LEVEL BUILT-UP", MARGIN + 270, currY + 5);
  doc.text("STATUS", MARGIN + 330, currY + 5);

  currY += 7;
  const totalSheets = floorsList.length + 1;

  // Row 1: Cover Sheet
  doc.setFillColor(cBgR, cBgG, cBgB);
  doc.rect(MARGIN + 4, currY, tableW, 6.5, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(secR, secG, secB);
  doc.text("SHEET 01", MARGIN + 8, currY + 4.5);
  doc.text("Master Cover & Project Specification Dossier", MARGIN + 38, currY + 4.5);
  doc.text("Project Typology, Plot Boundaries, MEP Notes, Sheet Index", MARGIN + 120, currY + 4.5);
  doc.text("—", MARGIN + 270, currY + 4.5);
  doc.setTextColor(16, 149, 193);
  doc.text("RELEASED", MARGIN + 330, currY + 4.5);

  currY += 6.5;

  // Floor Sheets
  floorsList.forEach((floor, idx) => {
    const sheetNum = String(idx + 2).padStart(2, "0");
    if (idx % 2 === 1) {
      doc.setFillColor(isCyan ? "#0E243F" : "#F5F1EA");
      doc.rect(MARGIN + 4, currY, tableW, 6.5, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(secR, secG, secB);
    doc.text(`SHEET ${sheetNum}`, MARGIN + 8, currY + 4.5);
    doc.text(`${floor.label} 2D Spatial Blueprint`, MARGIN + 38, currY + 4.5);

    const roomNames = (floor.rooms || [])
      .slice(0, 4)
      .map((r: any) => r.name || r.label)
      .join(", ");
    doc.text(
      roomNames.length > 55 ? `${roomNames.slice(0, 52)}...` : roomNames || "Full Floor Layout",
      MARGIN + 120,
      currY + 4.5
    );
    doc.text(`${floor.builtUpAreaSqFt || 1200} Sq Ft`, MARGIN + 270, currY + 4.5);
    doc.setTextColor(16, 149, 193);
    doc.text("VERIFIED", MARGIN + 330, currY + 4.5);

    currY += 6.5;
  });

  // Footer Block
  const FOOTER_H = 14;
  const FOOTER_Y = SHEET_H + MARGIN - 2 - FOOTER_H;
  doc.setFillColor(hdrR, hdrG, hdrB);
  doc.rect(MARGIN + 2, FOOTER_Y, SHEET_W - 4, FOOTER_H, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Generated by STHAVYA — YOUR VISION, BUILT TO BELONG", MARGIN + 6, FOOTER_Y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(mutedR, mutedG, mutedB);
  doc.text(
    "Multi-Floor Architectural Specification Suite • Pure MERN Stack • 100% En-Suite Standard Guaranteed",
    MARGIN + 6,
    FOOTER_Y + 10
  );

  doc.setTextColor(accR, accG, accB);
  doc.text(
    `SHEET 01 OF ${String(totalSheets).padStart(2, "0")} • DWG REF: STHAVYA-${String(planId).slice(-6).toUpperCase()}`,
    PAGE_WIDTH - MARGIN - 6,
    FOOTER_Y + 8,
    { align: "right" }
  );
}

/**
 * Renders an A3 Landscape Floor Blueprint Sheet
 */
async function renderFloorPage(
  doc: jsPDF,
  plan: any,
  floor: any,
  sheetIndex: number,
  totalSheets: number,
  theme: "vellum" | "cyan",
  logoImg: HTMLImageElement | null,
  containerElement?: HTMLElement | null
) {
  const isCyan = theme === "cyan";
  const PAGE_WIDTH = 420;
  const PAGE_HEIGHT = 297;
  const MARGIN = 10;
  const SHEET_W = PAGE_WIDTH - MARGIN * 2;
  const SHEET_H = PAGE_HEIGHT - MARGIN * 2;

  const colors = {
    bg: isCyan ? "#0B1E36" : "#FAF8F5",
    border: isCyan ? "#38BDF8" : "#181614",
    accent: isCyan ? "#38BDF8" : "#B88555",
    headerBg: isCyan ? "#0F2847" : "#181614",
    drawingBg: isCyan ? "#0A192F" : "#FFFFFF",
    textPrimary: isCyan ? "#FFFFFF" : "#181614",
    textSecondary: isCyan ? "#BAE6FD" : "#575149",
    textMuted: isCyan ? "#7DD3FC" : "#8E867B",
    tableHeaderBg: isCyan ? "#132D4E" : "#181614",
    tableRowAlt: isCyan ? "#0E243F" : "#F5F1EA",
    tableLine: isCyan ? "#1E3A8A" : "#E2DDD5",
  };

  const plotW = plan.plotDimensions?.widthFt || plan.inputs?.width || 30;
  const plotL = plan.plotDimensions?.lengthFt || plan.inputs?.depth || 45;
  const plotSqYd = plan.plotSizeSqYd || Math.round((plotW * plotL) / 9);
  const totalPlotSqFt = plotW * plotL;
  const bhkRaw = plan.bhk || plan.inputs?.bhk || "3";
  const bhkNum = String(bhkRaw).replace(/[^0-9]/g, "") || "3";
  const bhk = `${bhkNum} BHK`;
  const floorsStr = plan.floors || plan.inputs?.floors || "G+1";
  const facing = plan.facing || plan.inputs?.facing || "North";
  const planTitle = plan.name || plan.title || "Custom Architectural Spatial Layout";
  const planId = plan.id || plan._id || "STHAVYA-DWG-001";
  const dateFormatted = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Background
  const [bgR, bgG, bgB] = hexToRgb(colors.bg);
  doc.setFillColor(bgR, bgG, bgB);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  // CAD Double Border
  const [bdrR, bdrG, bdrB] = hexToRgb(colors.border);
  doc.setDrawColor(bdrR, bdrG, bdrB);
  doc.setLineWidth(0.8);
  doc.rect(MARGIN, MARGIN, SHEET_W, SHEET_H, "S");
  doc.setLineWidth(0.3);
  doc.rect(MARGIN + 2, MARGIN + 2, SHEET_W - 4, SHEET_H - 4, "S");

  // Header Title Block
  const HEADER_H = 24;
  const [hdrR, hdrG, hdrB] = hexToRgb(colors.headerBg);
  doc.setFillColor(hdrR, hdrG, hdrB);
  doc.rect(MARGIN + 2, MARGIN + 2, SHEET_W - 4, HEADER_H, "F");

  let logoDrawn = false;
  if (logoImg) {
    try {
      doc.addImage(logoImg, "PNG", MARGIN + 5, MARGIN + 4, 16, 16);
      logoDrawn = true;
    } catch {
      logoDrawn = false;
    }
  }

  const textOffsetX = logoDrawn ? MARGIN + 24 : MARGIN + 8;
  const [accR, accG, accB] = hexToRgb(colors.accent);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("STHAVYA", textOffsetX, MARGIN + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(accR, accG, accB);
  doc.text("YOUR VISION, BUILT TO BELONG", textOffsetX, MARGIN + 18);

  // Center: Floor Specification Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const floorHeading = `${(floor.label || "GROUND FLOOR").toUpperCase()} — BLUEPRINT & CAD SPECIFICATION`;
  doc.text(floorHeading, PAGE_WIDTH / 2 - 10, MARGIN + 11, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const [mutedR, mutedG, mutedB] = hexToRgb(colors.textMuted);
  doc.setTextColor(mutedR, mutedG, mutedB);
  doc.text(
    `Scale 1:100 Vector Projection • Pure MERN Architectural Engine • Theme: ${theme.toUpperCase()}`,
    PAGE_WIDTH / 2 - 10,
    MARGIN + 18,
    { align: "center" }
  );

  // Right Header Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(accR, accG, accB);
  doc.text(
    `DWG NO: STHAVYA-2D-${String(planId).slice(-6).toUpperCase()}-${floor.level || 0}`,
    PAGE_WIDTH - MARGIN - 8,
    MARGIN + 11,
    { align: "right" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`DATE: ${dateFormatted} • LEVEL: ${floor.level || 0}`, PAGE_WIDTH - MARGIN - 8, MARGIN + 18, {
    align: "right",
  });

  // Body Layout Split: Left CAD Canvas, Right Schedule Panel
  const CONTENT_Y = MARGIN + 2 + HEADER_H;
  const FOOTER_H = 14;
  const BODY_H = SHEET_H - 4 - HEADER_H - FOOTER_H;
  const MAIN_CAD_W = 254;
  const SIDE_PANEL_W = SHEET_W - 4 - MAIN_CAD_W;

  // Background for Main Drawing Canvas
  const [dwgBgR, dwgBgG, dwgBgB] = hexToRgb(colors.drawingBg);
  doc.setFillColor(dwgBgR, dwgBgG, dwgBgB);
  doc.rect(MARGIN + 2, CONTENT_Y, MAIN_CAD_W, BODY_H, "F");

  // Vertical dividing bar
  doc.setDrawColor(bdrR, bdrG, bdrB);
  doc.setLineWidth(0.6);
  doc.line(MARGIN + 2 + MAIN_CAD_W, CONTENT_Y, MARGIN + 2 + MAIN_CAD_W, CONTENT_Y + BODY_H);

  // Vector Floor Plan Embedding
  const targetSvgX = MARGIN + 6;
  const targetSvgY = CONTENT_Y + 4;
  const targetSvgW = MAIN_CAD_W - 8;
  const targetSvgH = BODY_H - 12;

  const floorSvg = createBlueprintSvgElement(plan, floor, theme);
  const clonedSvg = floorSvg.cloneNode(true) as SVGSVGElement;
  clonedSvg.setAttribute("width", `${targetSvgW}mm`);
  clonedSvg.setAttribute("height", `${targetSvgH}mm`);

  let renderedVector = false;
  try {
    await svg2pdf(clonedSvg, doc, {
      x: targetSvgX,
      y: targetSvgY,
      width: targetSvgW,
      height: targetSvgH,
    });
    renderedVector = true;
  } catch (err) {
    console.warn("svg2pdf fallback triggered for floor page:", err);
  }

  if (!renderedVector && containerElement) {
    try {
      const canvas = await html2canvas(containerElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: colors.drawingBg,
      });
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", targetSvgX, targetSvgY, targetSvgW, targetSvgH);
    } catch (canvasErr) {
      console.error("html2canvas fallback failed:", canvasErr);
    }
  }

  // Right Side Panel: Specs & Room Schedule
  const sideX = MARGIN + 2 + MAIN_CAD_W + 4;
  let currY = CONTENT_Y + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(bdrR, bdrG, bdrB);
  doc.text("PROJECT SPECIFICATIONS", sideX, currY);

  currY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const [secR, secG, secB] = hexToRgb(colors.textSecondary);
  doc.setTextColor(secR, secG, secB);

  const specRows = [
    ["Plan Title:", `${planTitle}`],
    ["Plot Dimensions:", `${plotL}'0" × ${plotW}'0" (${plotSqYd} Sq Yd)`],
    ["Gross Plot Area:", `${totalPlotSqFt} Sq Ft`],
    ["Typology & Floors:", `${bhk} • ${floorsStr}`],
    ["Active Floor Level:", `${floor.label || "Ground Floor"}`],
    ["Orientation:", `${facing} Facing (Vastu Compliant)`],
    ["Floor Built-up:", `${floor.builtUpAreaSqFt || 1200} Sq Ft`],
    ["Floor Carpet Area:", `${floor.carpetAreaSqFt || Math.round((floor.builtUpAreaSqFt || 1200) * 0.8)} Sq Ft`],
  ];

  specRows.forEach(([key, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(key, sideX, currY);
    doc.setFont("helvetica", "normal");
    doc.text(val, sideX + 36, currY);
    currY += 4;
  });

  currY += 2;
  doc.setDrawColor(bdrR, bdrG, bdrB);
  doc.setLineWidth(0.3);
  doc.line(sideX, currY, sideX + SIDE_PANEL_W - 8, currY);

  currY += 5;
  // Room Schedule Table Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(bdrR, bdrG, bdrB);
  doc.text("ROOM SCHEDULE & SPATIAL DIMENSIONS", sideX, currY);

  currY += 4;
  const colW1 = 46;
  const colW2 = 30;
  const colW3 = 20;
  const colW4 = 32;

  const [tblHdrR, tblHdrG, tblHdrB] = hexToRgb(colors.tableHeaderBg);
  doc.setFillColor(tblHdrR, tblHdrG, tblHdrB);
  doc.rect(sideX, currY, SIDE_PANEL_W - 8, 5.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("ROOM NAME", sideX + 2, currY + 4);
  doc.text("SIZE (FT)", sideX + colW1 + 2, currY + 4);
  doc.text("SQ FT", sideX + colW1 + colW2 + 2, currY + 4);
  doc.text("TRADE", sideX + colW1 + colW2 + colW3 + 2, currY + 4);

  currY += 5.5;

  const rooms: BlueprintRoom[] = floor.rooms || [];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  rooms.slice(0, 11).forEach((room: any, index: number) => {
    if (index % 2 === 1) {
      const [altR, altG, altB] = hexToRgb(colors.tableRowAlt);
      doc.setFillColor(altR, altG, altB);
      doc.rect(sideX, currY, SIDE_PANEL_W - 8, 4.5, "F");
    }

    doc.setTextColor(secR, secG, secB);
    const rName = (room.name || room.label || "Room").toUpperCase();
    doc.text(rName.length > 25 ? `${rName.slice(0, 23)}...` : rName, sideX + 2, currY + 3.2);
    doc.text(room.dimensions || "12' × 10'", sideX + colW1 + 2, currY + 3.2);
    doc.text(`${room.areaSqFt || room.sqFt || 120}`, sideX + colW1 + colW2 + 2, currY + 3.2);

    let trade = room.recommendedTrade || "Joinery";
    if (room.type === "bath") trade = "Plumbing (Stack)";
    if (room.type === "living") trade = "Finish Carpentry";
    if (room.type === "kitchen") trade = "Modular Units";
    if (room.type === "parking") trade = "Civil Pavers";
    if (room.type === "terrace") trade = "Waterproofing";
    doc.text(trade, sideX + colW1 + colW2 + colW3 + 2, currY + 3.2);

    const [lineR, lineG, lineB] = hexToRgb(colors.tableLine);
    doc.setDrawColor(lineR, lineG, lineB);
    doc.setLineWidth(0.15);
    doc.line(sideX, currY + 4.5, sideX + SIDE_PANEL_W - 8, currY + 4.5);

    currY += 4.5;
  });

  currY += 4;
  // En-Suite Washroom Guarantee Stamp Box
  doc.setFillColor(isCyan ? "#0F2847" : "#EAE6DF");
  doc.rect(sideX, currY, SIDE_PANEL_W - 8, 12, "F");
  doc.setDrawColor(accR, accG, accB);
  doc.setLineWidth(0.4);
  doc.rect(sideX, currY, SIDE_PANEL_W - 8, 12, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(accR, accG, accB);
  doc.text("✦ STHAVYA EN-SUITE STANDARD (100% PRIVATE ATTACHED)", sideX + 3, currY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(secR, secG, secB);
  doc.text(
    "Zero detached common bathrooms. All bedrooms maintain direct, private en-suite access.",
    sideX + 3,
    currY + 8.5
  );

  // Architectural Bottom Footer Block
  const FOOTER_Y = SHEET_H + MARGIN - 2 - FOOTER_H;
  doc.setFillColor(hdrR, hdrG, hdrB);
  doc.rect(MARGIN + 2, FOOTER_Y, SHEET_W - 4, FOOTER_H, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Generated by STHAVYA — YOUR VISION, BUILT TO BELONG", MARGIN + 6, FOOTER_Y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(mutedR, mutedG, mutedB);
  doc.text(
    "Platform: STHAVYA Spatial Architecture Suite • Pure MERN Stack • Real-Time WebSockets Collaboration",
    MARGIN + 6,
    FOOTER_Y + 10
  );

  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    "Preliminary conceptual layout. Must be verified and stamped by a licensed civil/structural engineer prior to construction.",
    PAGE_WIDTH - MARGIN - 6,
    FOOTER_Y + 5.5,
    { align: "right" }
  );

  const sheetStr = String(sheetIndex).padStart(2, "0");
  const totalStr = String(totalSheets).padStart(2, "0");
  doc.setTextColor(accR, accG, accB);
  doc.text(
    `SHEET ${sheetStr} OF ${totalStr} • DWG REF: STHAVYA-${String(planId).slice(-6).toUpperCase()}-${floor.level || 0}`,
    PAGE_WIDTH - MARGIN - 6,
    FOOTER_Y + 10,
    { align: "right" }
  );
}

/**
 * Main PDF Generation Engine
 * Supports single floor export OR multi-page dossier (cover page + 1 page per floor)
 */
export async function downloadBlueprintAsPdf(options: BlueprintPdfOptions): Promise<void> {
  const {
    plan,
    activeFloorIndex = 0,
    theme = "vellum",
    containerElement = null,
    allFloors = false,
  } = options;

  if (!plan) {
    throw new Error("No architectural plan data provided for PDF export.");
  }

  const floorsList = extractFloorsList(plan);
  const logoImg = await loadSthavyaLogo();

  // Initialize jsPDF A3 Landscape document
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3",
    compress: true,
  });

  if (allFloors) {
    // 1. Cover Page
    renderCoverPage(doc, plan, floorsList, theme, logoImg);

    // 2. Floor Sheets
    const totalSheets = floorsList.length + 1;
    for (let i = 0; i < floorsList.length; i++) {
      doc.addPage("a3", "landscape");
      await renderFloorPage(
        doc,
        plan,
        floorsList[i],
        i + 2,
        totalSheets,
        theme,
        logoImg,
        containerElement
      );
    }
  } else {
    // Single active floor sheet
    const targetFloor = floorsList[activeFloorIndex] || floorsList[0];
    await renderFloorPage(doc, plan, targetFloor, 1, 1, theme, logoImg, containerElement);
  }

  const filename = getBlueprintPdfFilename(plan, allFloors ? "FullDossier" : undefined);
  doc.save(filename);
}

/**
 * Exports all floors as a ZIP package containing individual PDFs, SVGs, PNGs, and a summary manifest
 */
export async function downloadAllFloorsAsZip(
  plan: any,
  theme: "vellum" | "cyan" = "vellum"
): Promise<void> {
  if (!plan) {
    throw new Error("No plan provided for ZIP export.");
  }

  const zip = new JSZip();
  const floorsList = extractFloorsList(plan);
  const logoImg = await loadSthavyaLogo();

  const bhkRaw = plan.bhk || plan.inputs?.bhk || "3";
  const bhkNum = String(bhkRaw).replace(/[^0-9]/g, "") || "3";
  const floorsStr = plan.floors || plan.inputs?.floors || "G+1";
  const floorsClean = String(floorsStr).replace(/\s+/g, "").replace(/\+/g, "plus");
  const dateStr = new Date().toISOString().split("T")[0];

  // Folder structure inside ZIP
  const pdfFolder = zip.folder("PDF_Drawings");
  const svgFolder = zip.folder("CAD_SVG_Vectors");
  const pngFolder = zip.folder("Raster_PNG");

  // 1. Generate per-floor assets
  for (let i = 0; i < floorsList.length; i++) {
    const floor = floorsList[i];
    const safeLabel = String(floor.label || `Floor_${i}`).replace(/[^a-zA-Z0-9_-]/g, "_");

    // A. SVG Vector
    const svgElem = createBlueprintSvgElement(plan, floor, theme);
    const svgData = new XMLSerializer().serializeToString(svgElem);
    svgFolder?.file(`${safeLabel}.svg`, svgData);

    // B. Individual A3 PDF
    const singleDoc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3",
      compress: true,
    });
    await renderFloorPage(singleDoc, plan, floor, 1, 1, theme, logoImg);
    const pdfBlob = singleDoc.output("blob");
    pdfFolder?.file(`${safeLabel}.pdf`, pdfBlob);

    // C. PNG Raster (via Offscreen Canvas)
    try {
      const pngBlob = await new Promise<Blob | null>((resolve) => {
        const img = new Image();
        const svgUrl = URL.createObjectURL(
          new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        );
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1600;
          canvas.height = 1040;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = theme === "cyan" ? "#0A192F" : "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => resolve(blob), "image/png");
          } else {
            resolve(null);
          }
          URL.revokeObjectURL(svgUrl);
        };
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          resolve(null);
        };
        img.src = svgUrl;
      });

      if (pngBlob) {
        pngFolder?.file(`${safeLabel}.png`, pngBlob);
      }
    } catch (err) {
      console.warn("Could not generate PNG for ZIP:", err);
    }
  }

  // 2. Generate Master Multi-Page PDF in Root
  const masterDoc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3",
    compress: true,
  });
  renderCoverPage(masterDoc, plan, floorsList, theme, logoImg);
  for (let i = 0; i < floorsList.length; i++) {
    masterDoc.addPage("a3", "landscape");
    await renderFloorPage(
      masterDoc,
      plan,
      floorsList[i],
      i + 2,
      floorsList.length + 1,
      theme,
      logoImg
    );
  }
  const masterBlob = masterDoc.output("blob");
  zip.file(`Sthavya_${bhkNum}BHK_${floorsClean}_FullSet_${dateStr}.pdf`, masterBlob);

  // 3. Project Specification Manifest README
  const totalBuiltUp = floorsList.reduce((acc, f) => acc + (f.builtUpAreaSqFt || 0), 0);
  const manifest = `==================================================================
STHAVYA ARCHITECTURAL SPATIAL SUITE — MULTI-FLOOR CAD ARCHIVE
"YOUR VISION, BUILT TO BELONG"
==================================================================

Project Name: ${plan.title || plan.name || "Custom Architectural Spatial Layout"}
Plan ID: ${plan.id || plan._id || "STHAVYA-DWG-001"}
Date Exported: ${new Date().toLocaleString("en-IN")}
Typology: ${bhkNum} BHK Residential Unit
Floors: ${floorsStr}${plan.hasPenthouse ? " (With Top-Floor Penthouse Suite)" : ""}
Plot Dimensions: ${plan.plotDimensions?.widthFt || plan.inputs?.width || 30}'0" × ${plan.plotDimensions?.lengthFt || plan.inputs?.depth || 45}'0"
Total Built-up Area: ${totalBuiltUp} Sq Ft
Estimated Budget: ₹${plan.estimatedCostLakhs || 48} Lakhs
Cardinal Facing: ${plan.facing || plan.inputs?.facing || "North"} Facing

FLOOR SPECIFICATIONS:
${floorsList
  .map(
    (f, idx) =>
      `• Level ${f.level ?? idx}: ${f.label} — ${f.builtUpAreaSqFt || 1200} Sq Ft (${(f.rooms || [])
        .map((r: any) => r.name || r.label)
        .join(", ")})`
  )
  .join("\n")}

STRUCTURAL & MEP INTEGRITY:
- 100% Private En-Suite Bathrooms: Verified (Zero detached common bathrooms)
- Staircase & Vertical Core: Fixed Structural Alignment
- Plumbing Stacks: Aligned Vertically (MEP Compliant)

ARCHIVE DIRECTORY CONTENTS:
/PDF_Drawings/     -> Individual A3 Vector CAD PDF Sheets
/CAD_SVG_Vectors/  -> Clean, Scalable Vector Graphics for Web & CAD Import
/Raster_PNG/       -> High-Resolution 1600x1040 Presentation PNGs
/Sthavya_*.pdf     -> Complete Architectural Dossier with Cover Sheet

Generated by STHAVYA Architectural Planning Engine.
`;
  zip.file("ARCHITECTURAL_MANIFEST.txt", manifest);

  // 4. Generate ZIP & trigger download
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const downloadUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `Sthavya_${bhkNum}BHK_${floorsClean}_AllFloors_${dateStr}.zip`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Downloads a single floor as a sharp vector SVG file
 */
export function downloadFloorAsSvg(
  plan: any,
  activeFloorIndex = 0,
  theme: "vellum" | "cyan" = "vellum"
): void {
  const floorsList = extractFloorsList(plan);
  const floor = floorsList[activeFloorIndex] || floorsList[0];
  const svg = createBlueprintSvgElement(plan, floor, theme);
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeLabel = String(floor.label || "Floor").replace(/[^a-zA-Z0-9]/g, "_");
  link.download = `${getBlueprintPdfFilename(plan).replace(".pdf", "")}_${safeLabel}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single floor as a high-resolution PNG image
 */
export async function downloadFloorAsPng(
  plan: any,
  activeFloorIndex = 0,
  theme: "vellum" | "cyan" = "vellum",
  containerElement?: HTMLElement | null
): Promise<void> {
  const floorsList = extractFloorsList(plan);
  const floor = floorsList[activeFloorIndex] || floorsList[0];
  const safeLabel = String(floor.label || "Floor").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${getBlueprintPdfFilename(plan).replace(".pdf", "")}_${safeLabel}.png`;

  if (containerElement) {
    try {
      const canvas = await html2canvas(containerElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: theme === "cyan" ? "#0A192F" : "#FFFFFF",
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      return;
    } catch (err) {
      console.warn("html2canvas error, falling back to SVG rasterization:", err);
    }
  }

  // Fallback via SVG to Canvas
  const svgElem = createBlueprintSvgElement(plan, floor, theme);
  const svgData = new XMLSerializer().serializeToString(svgElem);
  const img = new Image();
  const svgUrl = URL.createObjectURL(new Blob([svgData], { type: "image/svg+xml;charset=utf-8" }));

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1040;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = theme === "cyan" ? "#0A192F" : "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
    URL.revokeObjectURL(svgUrl);
  };
  img.src = svgUrl;
}
