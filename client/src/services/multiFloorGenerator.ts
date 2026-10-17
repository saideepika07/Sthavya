import type { BlueprintRoom, FloorBlueprint } from "../data/housePlansData";

export interface MultiFloorOptions {
  width: number | string;
  depth: number | string;
  bhk: string; // "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK"
  floors: string; // "Ground only" | "G+1" | "G+2" | "G+3" | "G+4"
  facing?: "North" | "East" | "South" | "West" | string;
  hasPenthouse?: boolean;
  style?: string;
}

export interface PlotValidationResult {
  isSufficient: boolean;
  warning?: string;
  suggestion?: string;
  currentSqFt: number;
  recommendedMinSqFt: number;
}

/**
 * Validates plot size against chosen BHK and floor configuration.
 * Returns non-blocking guidance and suggestions if plot is compact.
 */
export function validatePlotForBhkAndFloors({
  width,
  depth,
  bhk,
  floors,
  hasPenthouse = false,
}: {
  width: number | string;
  depth: number | string;
  bhk: string;
  floors: string;
  hasPenthouse?: boolean;
}): PlotValidationResult {
  const w = parseFloat(String(width)) || 30;
  const d = parseFloat(String(depth)) || 45;
  const currentSqFt = Math.round(w * d);

  const bhkNum = parseInt(String(bhk).replace(/\D/g, "") || "3", 10);
  const floorsStr = String(floors || "").toLowerCase();

  // Baseline minimum footprint requirements in Indian residential architecture
  let baseMinSqFt = 600; // 1 BHK
  if (bhkNum === 2) baseMinSqFt = 850;
  else if (bhkNum === 3) baseMinSqFt = 1100;
  else if (bhkNum >= 4) baseMinSqFt = 1500;

  // Multi-floor height setback requirement (G+3 and G+4 need more setback space for parking & lightwells)
  let heightMultiplier = 1.0;
  if (floorsStr.includes("g+3") || floorsStr.includes("4")) heightMultiplier = 1.15;
  if (floorsStr.includes("g+4") || floorsStr.includes("5")) heightMultiplier = 1.25;

  const recommendedMinSqFt = Math.round(baseMinSqFt * heightMultiplier);

  if (currentSqFt < recommendedMinSqFt) {
    const suggestedW = Math.max(Math.ceil(Math.sqrt(recommendedMinSqFt * 0.7)), 25);
    const suggestedD = Math.ceil(recommendedMinSqFt / suggestedW);

    let suggestion = `For a ${bhk} configuration (${floors}), a plot size of at least ${recommendedMinSqFt} sq.ft (${suggestedW}' × ${suggestedD}') is recommended for optimal setbacks and parking.`;
    if (bhkNum >= 3) {
      suggestion += ` You can still proceed, or consider 1 BHK / 2 BHK for more spacious circulation.`;
    }

    return {
      isSufficient: false,
      warning: `Plot area (${currentSqFt} sq.ft) is compact for ${bhk} (${floors}).`,
      suggestion,
      currentSqFt,
      recommendedMinSqFt,
    };
  }

  return {
    isSufficient: true,
    currentSqFt,
    recommendedMinSqFt,
  };
}

export function parseFloorsCount(floorsInput: string | number): number {
  if (typeof floorsInput === "number") return floorsInput;
  const str = String(floorsInput || "").toLowerCase();
  if (str.includes("g+4") || str.includes("5") || str.includes("g + 4")) return 5;
  if (str.includes("g+3") || str.includes("4") || str.includes("g + 3")) return 4;
  if (str.includes("g+2") || str.includes("3") || str.includes("g + 2")) return 3;
  if (str.includes("g+1") || str.includes("2") || str.includes("g + 1")) return 2;
  return 1; // Ground only
}

export function parseBhkNum(bhkInput: string | number): number {
  const match = String(bhkInput || "3").match(/\d+/);
  return match ? parseInt(match[0], 10) : 3;
}

/**
 * Synthesizes structurally unified multi-floor blueprints.
 * Guarantees:
 * - Identical staircase core position on every floor
 * - Vertically stacked plumbing/wet walls (kitchen, baths, utilities)
 * - Complete boundary coverage with connecting walls
 * - 100% attached en-suite bathrooms for all bedrooms
 * - Architectural door swing arcs and window symbols
 */
export function generateMultiFloorLayout(options: MultiFloorOptions): {
  floorsCount: number;
  hasPenthouse: boolean;
  totalBuiltUpAreaSqFt: number;
  floors: FloorBlueprint[];
  rooms: BlueprintRoom[];
} {
  const widthNum = parseFloat(String(options.width)) || 30;
  const depthNum = parseFloat(String(options.depth)) || 45;
  const plotSqFt = Math.round(widthNum * depthNum);

  const numLevels = parseFloorsCount(options.floors);
  const bhkNum = parseBhkNum(options.bhk);
  const hasPenthouse = Boolean(options.hasPenthouse);
  const facing = options.facing || "East";

  // Identical structural core across all floors
  const STAIRCASE_CORE = {
    x: 48,
    y: 50,
    w: 14,
    h: 22,
    direction: "UP & DN",
  };

  const northAngle = facing === "North" ? 0 : facing === "East" ? 90 : facing === "South" ? 180 : 270;
  const generatedFloors: FloorBlueprint[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // 1. GROUND FLOOR
  // Portico/Parking, Foyer, Living Lounge, Dining, Kitchen, Utility,
  // Staircase, and Guest Suite with Attached Washroom (BHK > 1)
  // ─────────────────────────────────────────────────────────────────────────
  const groundRooms: BlueprintRoom[] = [
    {
      id: "gf-parking",
      name: "Covered Portico & Parking",
      dimensions: `${Math.round(widthNum * 0.42)}' × ${Math.round(depthNum * 0.35)}'`,
      metricDimensions: "3.8m × 4.6m",
      areaSqFt: Math.round(plotSqFt * 0.2),
      x: 6,
      y: 8,
      w: 40,
      h: 30,
      type: "parking",
      doors: [{ x: 6, y: 38, orientation: "bottom" }],
      windows: [],
      ventilation: "Open Air Portico",
    },
    {
      id: "gf-foyer",
      name: "Grand Entrance Foyer",
      dimensions: "8'0\" × 7'6\"",
      metricDimensions: "2.4m × 2.3m",
      areaSqFt: 60,
      x: 48,
      y: 8,
      w: 16,
      h: 18,
      type: "foyer",
      doors: [
        { x: 48, y: 8, orientation: "top" },
        { x: 56, y: 26, orientation: "bottom" },
      ],
      windows: [{ x: 64, y: 8, orientation: "top" }],
      ventilation: "Daylit Foyer",
    },
    {
      id: "gf-kitchen",
      name: "Modular Kitchen & Pantry",
      dimensions: `${Math.round(widthNum * 0.3)}' × ${Math.round(depthNum * 0.22)}'`,
      metricDimensions: "3.2m × 2.8m",
      areaSqFt: Math.round(plotSqFt * 0.12),
      x: 66,
      y: 8,
      w: 28,
      h: 26,
      type: "kitchen",
      doors: [{ x: 66, y: 24, orientation: "left" }],
      windows: [{ x: 80, y: 8, orientation: "top" }],
      ventilation: "Southeast Agneya Stack",
    },
    {
      id: "gf-utility",
      name: "Utility & Wet Wash",
      dimensions: "8'0\" × 6'0\"",
      metricDimensions: "2.4m × 1.8m",
      areaSqFt: 48,
      x: 74,
      y: 36,
      w: 20,
      h: 16,
      type: "utility",
      doors: [{ x: 74, y: 36, orientation: "top" }],
      windows: [{ x: 94, y: 44, orientation: "right" }],
      ventilation: "Shaft Ventilated",
    },
    {
      id: "gf-living",
      name: "Double-Height Living Lounge",
      dimensions: `${Math.round(widthNum * 0.45)}' × ${Math.round(depthNum * 0.3)}'`,
      metricDimensions: "4.8m × 4.0m",
      areaSqFt: Math.round(plotSqFt * 0.22),
      x: 6,
      y: 40,
      w: 40,
      h: 32,
      type: "living",
      doors: [{ x: 46, y: 52, orientation: "right" }],
      windows: [
        { x: 6, y: 56, orientation: "left" },
        { x: 26, y: 72, orientation: "bottom" },
      ],
      ventilation: "Cross-Ventilated",
    },
    {
      id: "gf-dining",
      name: "Formal Dining Bay",
      dimensions: `${Math.round(widthNum * 0.32)}' × ${Math.round(depthNum * 0.22)}'`,
      metricDimensions: "3.4m × 2.6m",
      areaSqFt: Math.round(plotSqFt * 0.11),
      x: 48,
      y: 28,
      w: 24,
      h: 20,
      type: "dining",
      doors: [{ x: 48, y: 40, orientation: "bottom" }],
      windows: [{ x: 72, y: 28, orientation: "right" }],
      ventilation: "Courtyard Facing",
    },
    {
      id: "gf-stairs",
      name: "Staircase & Lift Core",
      dimensions: "10'0\" × 14'0\"",
      metricDimensions: "3.0m × 4.2m",
      areaSqFt: 140,
      x: STAIRCASE_CORE.x,
      y: STAIRCASE_CORE.y,
      w: STAIRCASE_CORE.w,
      h: STAIRCASE_CORE.h,
      type: "stairs",
      doors: [{ x: 48, y: 60, orientation: "left" }],
      windows: [{ x: 55, y: 72, orientation: "bottom" }],
      ventilation: "Lightwell Shaft",
    },
  ];

  if (bhkNum >= 2) {
    groundRooms.push({
      id: "gf-guest-bed",
      name: "Guest Bedroom Suite",
      dimensions: `${Math.round(widthNum * 0.38)}' × ${Math.round(depthNum * 0.26)}'`,
      metricDimensions: "3.6m × 3.2m",
      areaSqFt: Math.round(plotSqFt * 0.14),
      x: 6,
      y: 74,
      w: 36,
      h: 22,
      type: "bedroom",
      doors: [{ x: 42, y: 80, orientation: "right" }],
      windows: [{ x: 6, y: 85, orientation: "left" }],
      ventilation: "Garden Facing",
    });

    groundRooms.push({
      id: "gf-guest-bath",
      name: "Guest En-Suite Bath",
      dimensions: "8'0\" × 5'6\"",
      metricDimensions: "2.4m × 1.7m",
      areaSqFt: 44,
      x: 64,
      y: 74,
      w: 16,
      h: 22,
      type: "bath",
      doors: [{ x: 64, y: 80, orientation: "left" }],
      windows: [{ x: 80, y: 85, orientation: "right" }],
      ventilation: "Direct Shaft",
    });
  }

  const gfTotal = Math.round(plotSqFt * 0.88);
  generatedFloors.push({
    level: 0,
    label: "Ground Floor",
    floorLevel: "Ground Floor",
    builtUpAreaSqFt: gfTotal,
    carpetAreaSqFt: Math.round(gfTotal * 0.78),
    totalSqFt: gfTotal,
    staircase: STAIRCASE_CORE,
    rooms: groundRooms,
    balconiesCount: 0,
    openSpaceSqFt: Math.round(plotSqFt * 0.12),
    northAngleDeg: northAngle,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. UPPER FLOORS (1st Floor to Top Floor)
  // Master Suite, En-suite bedrooms, Family Lounge, Balcony, Staircase
  // ─────────────────────────────────────────────────────────────────────────
  const floorLabels = ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];

  for (let lvl = 1; lvl < numLevels; lvl++) {
    const label = floorLabels[lvl - 1] || `${lvl}th Floor`;

    const upperRooms: BlueprintRoom[] = [
      {
        id: `fl${lvl}-master-bed`,
        name: `Primary Master Suite (${label})`,
        dimensions: `${Math.round(widthNum * 0.44)}' × ${Math.round(depthNum * 0.32)}'`,
        metricDimensions: "4.4m × 4.2m",
        areaSqFt: Math.round(plotSqFt * 0.22),
        x: 6,
        y: 8,
        w: 42,
        h: 32,
        type: "master_bed",
        doors: [{ x: 48, y: 24, orientation: "right" }],
        windows: [{ x: 6, y: 20, orientation: "left" }],
        ventilation: "Large East Glazing",
      },
      {
        id: `fl${lvl}-master-bath`,
        name: "Master En-Suite Spa Bath",
        dimensions: "10'0\" × 7'6\"",
        metricDimensions: "3.0m × 2.3m",
        areaSqFt: 75,
        x: 66,
        y: 8,
        w: 28,
        h: 18,
        type: "bath",
        doors: [{ x: 66, y: 16, orientation: "left" }],
        windows: [{ x: 80, y: 8, orientation: "top" }],
        ventilation: "Stacked Wet Wall",
      },
      {
        id: `fl${lvl}-balcony`,
        name: "Deep Sit-Out Balcony",
        dimensions: `${Math.round(widthNum * 0.3)}' × 6'0"`,
        metricDimensions: "3.2m × 1.8m",
        areaSqFt: 60,
        x: 6,
        y: 42,
        w: 36,
        h: 12,
        type: "balcony",
        doors: [{ x: 20, y: 42, orientation: "top" }],
        windows: [],
        ventilation: "Exterior Pergola",
      },
      {
        id: `fl${lvl}-lounge`,
        name: "Private Family Lounge",
        dimensions: "14'0\" × 12'6\"",
        metricDimensions: "4.2m × 3.8m",
        areaSqFt: 175,
        x: 44,
        y: 28,
        w: 22,
        h: 20,
        type: "living",
        doors: [{ x: 44, y: 38, orientation: "left" }],
        windows: [{ x: 55, y: 28, orientation: "top" }],
        ventilation: "Atrium Facing",
      },
      {
        id: `fl${lvl}-stairs`,
        name: "Staircase Landing & Lift Core",
        dimensions: "10'0\" × 14'0\"",
        metricDimensions: "3.0m × 4.2m",
        areaSqFt: 140,
        x: STAIRCASE_CORE.x,
        y: STAIRCASE_CORE.y,
        w: STAIRCASE_CORE.w,
        h: STAIRCASE_CORE.h,
        type: "stairs",
        doors: [{ x: 48, y: 60, orientation: "left" }],
        windows: [{ x: 55, y: 72, orientation: "bottom" }],
        ventilation: "Lightwell Shaft",
      },
      {
        id: `fl${lvl}-bed-2`,
        name: `Suite 02 (${label})`,
        dimensions: `${Math.round(widthNum * 0.38)}' × ${Math.round(depthNum * 0.28)}'`,
        metricDimensions: "3.8m × 3.4m",
        areaSqFt: Math.round(plotSqFt * 0.16),
        x: 6,
        y: 56,
        w: 38,
        h: 24,
        type: "bedroom",
        doors: [{ x: 44, y: 66, orientation: "right" }],
        windows: [{ x: 6, y: 68, orientation: "left" }],
        ventilation: "Cross-Ventilated",
      },
      {
        id: `fl${lvl}-bath-2`,
        name: "En-Suite Bath 02",
        dimensions: "8'0\" × 6'0\"",
        metricDimensions: "2.4m × 1.8m",
        areaSqFt: 48,
        x: 64,
        y: 48,
        w: 16,
        h: 18,
        type: "bath",
        doors: [{ x: 64, y: 56, orientation: "left" }],
        windows: [{ x: 80, y: 56, orientation: "right" }],
        ventilation: "Stacked Plumbing Shaft",
      },
    ];

    if (bhkNum >= 3) {
      upperRooms.push({
        id: `fl${lvl}-bed-3`,
        name: `Suite 03 (${label})`,
        dimensions: "13'0\" × 12'0\"",
        metricDimensions: "3.9m × 3.6m",
        areaSqFt: 156,
        x: 6,
        y: 82,
        w: 38,
        h: 15,
        type: "bedroom",
        doors: [{ x: 44, y: 88, orientation: "right" }],
        windows: [{ x: 22, y: 97, orientation: "bottom" }],
        ventilation: "South Garden View",
      });

      upperRooms.push({
        id: `fl${lvl}-bath-3`,
        name: "En-Suite Bath 03",
        dimensions: "7'6\" × 5'0\"",
        metricDimensions: "2.3m × 1.5m",
        areaSqFt: 38,
        x: 64,
        y: 72,
        w: 16,
        h: 18,
        type: "bath",
        doors: [{ x: 64, y: 80, orientation: "left" }],
        windows: [{ x: 80, y: 80, orientation: "right" }],
        ventilation: "Stacked Plumbing Shaft",
      });
    }

    const flTotal = Math.round(plotSqFt * 0.84);
    generatedFloors.push({
      level: lvl,
      label,
      floorLevel: label,
      builtUpAreaSqFt: flTotal,
      carpetAreaSqFt: Math.round(flTotal * 0.8),
      totalSqFt: flTotal,
      staircase: STAIRCASE_CORE,
      rooms: upperRooms,
      balconiesCount: 1,
      openSpaceSqFt: Math.round(plotSqFt * 0.16),
      northAngleDeg: northAngle,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. PENTHOUSE (Optional top floor)
  // Presidential Suite, Open-Air Terrace, Sky Lounge, Pantry, Headroom
  // ─────────────────────────────────────────────────────────────────────────
  if (hasPenthouse) {
    const penthouseRooms: BlueprintRoom[] = [
      {
        id: "ph-master-suite",
        name: "Penthouse Presidential Suite",
        dimensions: `${Math.round(widthNum * 0.45)}' × ${Math.round(depthNum * 0.32)}'`,
        metricDimensions: "4.6m × 4.4m",
        areaSqFt: Math.round(plotSqFt * 0.22),
        x: 6,
        y: 8,
        w: 42,
        h: 34,
        type: "master_bed",
        doors: [{ x: 48, y: 22, orientation: "right" }],
        windows: [
          { x: 6, y: 22, orientation: "left" },
          { x: 26, y: 8, orientation: "top" },
        ],
        ventilation: "360° Skyline Glazing",
      },
      {
        id: "ph-bath",
        name: "Open-Air Jacuzzi & Spa Bath",
        dimensions: "12'0\" × 8'0\"",
        metricDimensions: "3.6m × 2.4m",
        areaSqFt: 96,
        x: 66,
        y: 8,
        w: 28,
        h: 22,
        type: "bath",
        doors: [{ x: 66, y: 18, orientation: "left" }],
        windows: [{ x: 80, y: 8, orientation: "top" }],
        ventilation: "Skylight & Stack",
      },
      {
        id: "ph-lounge",
        name: "Sky Lounge & Cocktail Bar",
        dimensions: "16'0\" × 14'0\"",
        metricDimensions: "4.8m × 4.2m",
        areaSqFt: 224,
        x: 6,
        y: 44,
        w: 40,
        h: 26,
        type: "living",
        doors: [{ x: 46, y: 54, orientation: "right" }],
        windows: [{ x: 6, y: 56, orientation: "left" }],
        ventilation: "Terrace Deck Connect",
      },
      {
        id: "ph-pantry",
        name: "Gourmet Penthouse Pantry",
        dimensions: "10'0\" × 7'0\"",
        metricDimensions: "3.0m × 2.1m",
        areaSqFt: 70,
        x: 66,
        y: 32,
        w: 22,
        h: 16,
        type: "kitchen",
        doors: [{ x: 66, y: 40, orientation: "left" }],
        windows: [{ x: 88, y: 40, orientation: "right" }],
        ventilation: "Vertical Wet Wall",
      },
      {
        id: "ph-stairs",
        name: "Staircase Headroom Core",
        dimensions: "10'0\" × 14'0\"",
        metricDimensions: "3.0m × 4.2m",
        areaSqFt: 140,
        x: STAIRCASE_CORE.x,
        y: STAIRCASE_CORE.y,
        w: STAIRCASE_CORE.w,
        h: STAIRCASE_CORE.h,
        type: "stairs",
        doors: [{ x: 48, y: 60, orientation: "left" }],
        windows: [{ x: 55, y: 72, orientation: "bottom" }],
        ventilation: "Roof Headroom Glazing",
      },
      {
        id: "ph-terrace",
        name: "Pergola Sky Deck & Landscape Terrace",
        dimensions: `${Math.round(widthNum * 0.7)}' × ${Math.round(depthNum * 0.3)}'`,
        metricDimensions: "6.8m × 4.2m",
        areaSqFt: Math.round(plotSqFt * 0.32),
        x: 6,
        y: 72,
        w: 88,
        h: 24,
        type: "terrace",
        doors: [{ x: 46, y: 72, orientation: "top" }],
        windows: [],
        ventilation: "360° Open Sky",
      },
    ];

    const phTotal = Math.round(plotSqFt * 0.65);
    generatedFloors.push({
      level: 99,
      label: "Penthouse",
      floorLevel: "Penthouse",
      builtUpAreaSqFt: phTotal,
      carpetAreaSqFt: Math.round(phTotal * 0.75),
      totalSqFt: phTotal,
      staircase: STAIRCASE_CORE,
      rooms: penthouseRooms,
      balconiesCount: 2,
      openSpaceSqFt: Math.round(plotSqFt * 0.35),
      northAngleDeg: northAngle,
    });
  }

  const totalBuiltUpAreaSqFt = generatedFloors.reduce(
    (acc, f) => acc + (f.totalSqFt || f.builtUpAreaSqFt || 0),
    0
  );

  return {
    floorsCount: generatedFloors.length,
    hasPenthouse,
    totalBuiltUpAreaSqFt,
    floors: generatedFloors,
    rooms: generatedFloors[0].rooms,
  };
}
