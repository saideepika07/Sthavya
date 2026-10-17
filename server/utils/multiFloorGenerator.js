/**
 * STHAVYA Multi-Floor Structural Layout Engine
 * Generates structurally consistent, plumbed, and circulation-optimized
 * multi-level CAD floor plans (Ground Floor up to G+4 + Penthouse).
 */

export function parseFloorsCount(floorsInput) {
  if (typeof floorsInput === "number") return floorsInput;
  const str = String(floorsInput || "").toLowerCase();
  if (str.includes("g+4") || str.includes("5") || str.includes("g + 4")) return 5;
  if (str.includes("g+3") || str.includes("4") || str.includes("g + 3")) return 4;
  if (str.includes("g+2") || str.includes("3") || str.includes("g + 2")) return 3;
  if (str.includes("g+1") || str.includes("2") || str.includes("g + 1")) return 2;
  return 1; // Ground only
}

export function parseBhkNum(bhkInput) {
  const match = String(bhkInput || "3").match(/\d+/);
  return match ? parseInt(match[0], 10) : 3;
}

export function generateMultiFloorLayout({
  width = 30,
  depth = 45,
  bhk = "3 BHK",
  floors = "G+1",
  facing = "East",
  hasPenthouse = false,
  style = "Modern",
}) {
  const widthNum = parseFloat(width) || 30;
  const depthNum = parseFloat(depth) || 45;
  const plotSqFt = Math.round(widthNum * depthNum);
  const plotSqYd = Math.round(plotSqFt / 9);

  const numLevels = parseFloorsCount(floors);
  const bhkNum = parseBhkNum(bhk);

  // Common structural core: Staircase & Lift shaft must remain identical on every floor
  const STAIRCASE_CORE = {
    x: 48,
    y: 50,
    w: 14,
    h: 22,
    direction: "UP & DN",
  };

  const northAngle = facing === "North" ? 0 : facing === "East" ? 90 : facing === "South" ? 180 : 270;

  const generatedFloors = [];

  // ───────────────────────────────────────────────────────────────────────────
  // 1. GROUND FLOOR
  // Parking/Portico, Entry Foyer, Living Lounge, Dining, Kitchen, Utility,
  // Staircase, and Guest Bedroom with Attached Bath (when BHK > 1)
  // ───────────────────────────────────────────────────────────────────────────
  const groundRooms = [
    {
      id: "gf-parking",
      name: "Covered Portico & Parking",
      label: "Covered Portico & Parking",
      dimensions: `${Math.round(widthNum * 0.42)}' × ${Math.round(depthNum * 0.35)}'`,
      metricDimensions: "3.8m × 4.6m",
      areaSqFt: Math.round(plotSqFt * 0.2),
      sqFt: Math.round(plotSqFt * 0.2),
      x: 6,
      y: 8,
      w: 40,
      h: 30,
      type: "parking",
      doors: [{ x: 6, y: 38, orientation: "bottom" }],
      windows: [],
      ventilation: "Open Air Portico",
      recommendedTrade: "Civil Concrete Pavers",
      isEnSuite: false,
    },
    {
      id: "gf-foyer",
      name: "Grand Entrance Foyer",
      label: "Grand Entrance Foyer",
      dimensions: "8'0\" × 7'6\"",
      metricDimensions: "2.4m × 2.3m",
      areaSqFt: 60,
      sqFt: 60,
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
      recommendedTrade: "Italian Marble Inlay",
      isEnSuite: false,
    },
    {
      id: "gf-kitchen",
      name: "Modular Kitchen & Pantry",
      label: "Modular Kitchen & Pantry",
      dimensions: `${Math.round(widthNum * 0.3)}' × ${Math.round(depthNum * 0.22)}'`,
      metricDimensions: "3.2m × 2.8m",
      areaSqFt: Math.round(plotSqFt * 0.12),
      sqFt: Math.round(plotSqFt * 0.12),
      x: 66,
      y: 8,
      w: 28,
      h: 26,
      type: "kitchen",
      doors: [{ x: 66, y: 24, orientation: "left" }],
      windows: [{ x: 80, y: 8, orientation: "top" }],
      ventilation: "Southeast Agneya Stack",
      recommendedTrade: "Modular Kitchen Specialist",
      isEnSuite: false,
    },
    {
      id: "gf-utility",
      name: "Utility & Wet Wash",
      label: "Utility & Wet Wash",
      dimensions: "8'0\" × 6'0\"",
      metricDimensions: "2.4m × 1.8m",
      areaSqFt: 48,
      sqFt: 48,
      x: 74,
      y: 36,
      w: 20,
      h: 16,
      type: "utility",
      doors: [{ x: 74, y: 36, orientation: "top" }],
      windows: [{ x: 94, y: 44, orientation: "right" }],
      ventilation: "Shaft Ventilated",
      recommendedTrade: "Sanitary Plumber",
      isEnSuite: false,
    },
    {
      id: "gf-living",
      name: "Double-Height Living Lounge",
      label: "Double-Height Living Lounge",
      dimensions: `${Math.round(widthNum * 0.45)}' × ${Math.round(depthNum * 0.3)}'`,
      metricDimensions: "4.8m × 4.0m",
      areaSqFt: Math.round(plotSqFt * 0.22),
      sqFt: Math.round(plotSqFt * 0.22),
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
      recommendedTrade: "Master Finish Carpenter",
      isEnSuite: false,
    },
    {
      id: "gf-dining",
      name: "Formal Dining Bay",
      label: "Formal Dining Bay",
      dimensions: `${Math.round(widthNum * 0.32)}' × ${Math.round(depthNum * 0.22)}'`,
      metricDimensions: "3.4m × 2.6m",
      areaSqFt: Math.round(plotSqFt * 0.11),
      sqFt: Math.round(plotSqFt * 0.11),
      x: 48,
      y: 28,
      w: 24,
      h: 20,
      type: "dining",
      doors: [{ x: 48, y: 40, orientation: "bottom" }],
      windows: [{ x: 72, y: 28, orientation: "right" }],
      ventilation: "Courtyard Facing",
      recommendedTrade: "Interior Millwork",
      isEnSuite: false,
    },
    {
      id: "gf-stairs",
      name: "Architectural Staircase Core",
      label: "Architectural Staircase Core",
      dimensions: "10'0\" × 14'0\"",
      metricDimensions: "3.0m × 4.2m",
      areaSqFt: 140,
      sqFt: 140,
      x: STAIRCASE_CORE.x,
      y: STAIRCASE_CORE.y,
      w: STAIRCASE_CORE.w,
      h: STAIRCASE_CORE.h,
      type: "stairs",
      doors: [{ x: 48, y: 60, orientation: "left" }],
      windows: [{ x: 55, y: 72, orientation: "bottom" }],
      ventilation: "Lightwell Shaft",
      recommendedTrade: "Structural Steel & Timber",
      isEnSuite: false,
    },
  ];

  // Ground Floor Guest Bedroom if BHK > 1
  if (bhkNum >= 2) {
    groundRooms.push({
      id: "gf-guest-bed",
      name: "Guest Suite 01",
      label: "Guest Suite 01",
      dimensions: `${Math.round(widthNum * 0.38)}' × ${Math.round(depthNum * 0.26)}'`,
      metricDimensions: "3.6m × 3.2m",
      areaSqFt: Math.round(plotSqFt * 0.14),
      sqFt: Math.round(plotSqFt * 0.14),
      x: 6,
      y: 74,
      w: 36,
      h: 22,
      type: "bedroom",
      doors: [{ x: 42, y: 80, orientation: "right" }],
      windows: [{ x: 6, y: 85, orientation: "left" }],
      ventilation: "Garden Facing",
      recommendedTrade: "Joinery & Wardrobes",
      isEnSuite: true,
    });

    groundRooms.push({
      id: "gf-guest-bath",
      name: "Guest En-Suite Bath",
      label: "Guest En-Suite Bath",
      dimensions: "8'0\" × 5'6\"",
      metricDimensions: "2.4m × 1.7m",
      areaSqFt: 44,
      sqFt: 44,
      x: 64,
      y: 74,
      w: 16,
      h: 22,
      type: "bath",
      doors: [{ x: 64, y: 80, orientation: "left" }],
      windows: [{ x: 80, y: 85, orientation: "right" }],
      ventilation: "Direct Shaft",
      recommendedTrade: "Sanitary Plumber",
      isEnSuite: true,
    });
  }

  const gfTotalSqFt = Math.round(plotSqFt * 0.88);
  generatedFloors.push({
    level: 0,
    label: "Ground Floor",
    builtUpAreaSqFt: gfTotalSqFt,
    carpetAreaSqFt: Math.round(gfTotalSqFt * 0.78),
    totalSqFt: gfTotalSqFt,
    staircase: STAIRCASE_CORE,
    rooms: groundRooms,
    northAngleDeg: northAngle,
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. UPPER FLOORS (1st Floor to top level)
  // Bed rooms with 100% attached washrooms, Family lounge, Balcony,
  // Staircase landing in EXACT same core position
  // ───────────────────────────────────────────────────────────────────────────
  const floorLabels = ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];

  for (let lvl = 1; lvl < numLevels; lvl++) {
    const label = floorLabels[lvl - 1] || `${lvl}th Floor`;

    const upperRooms = [
      // Master Bedroom Suite (positioned over living / portico)
      {
        id: `fl${lvl}-master-bed`,
        name: `Primary Master Suite (${label})`,
        label: `Primary Master Suite (${label})`,
        dimensions: `${Math.round(widthNum * 0.44)}' × ${Math.round(depthNum * 0.32)}'`,
        metricDimensions: "4.4m × 4.2m",
        areaSqFt: Math.round(plotSqFt * 0.22),
        sqFt: Math.round(plotSqFt * 0.22),
        x: 6,
        y: 8,
        w: 42,
        h: 32,
        type: "master_bed",
        doors: [{ x: 48, y: 24, orientation: "right" }],
        windows: [{ x: 6, y: 20, orientation: "left" }],
        ventilation: "Large East Glazing",
        recommendedTrade: "Bespoke Master Millwork",
        isEnSuite: true,
      },
      // Attached Master Washroom (stacked over plumbing)
      {
        id: `fl${lvl}-master-bath`,
        name: "Master En-Suite Spa Bath",
        label: "Master En-Suite Spa Bath",
        dimensions: "10'0\" × 7'6\"",
        metricDimensions: "3.0m × 2.3m",
        areaSqFt: 75,
        sqFt: 75,
        x: 66,
        y: 8,
        w: 28,
        h: 18,
        type: "bath",
        doors: [{ x: 66, y: 16, orientation: "left" }],
        windows: [{ x: 80, y: 8, orientation: "top" }],
        ventilation: "Stacked Wet Wall",
        recommendedTrade: "Concealed Sanitary Fittings",
        isEnSuite: true,
      },
      // Balcony Sit-Out Deck
      {
        id: `fl${lvl}-balcony`,
        name: "Deep Sit-Out Balcony",
        label: "Deep Sit-Out Balcony",
        dimensions: `${Math.round(widthNum * 0.3)}' × 6'0"`,
        metricDimensions: "3.2m × 1.8m",
        areaSqFt: 60,
        sqFt: 60,
        x: 6,
        y: 42,
        w: 36,
        h: 12,
        type: "balcony",
        doors: [{ x: 20, y: 42, orientation: "top" }],
        windows: [],
        ventilation: "Exterior Pergola",
        recommendedTrade: "Toughened Glass Railing",
        isEnSuite: false,
      },
      // Family Lounge / Media Room
      {
        id: `fl${lvl}-lounge`,
        name: "Private Family Lounge",
        label: "Private Family Lounge",
        dimensions: "14'0\" × 12'6\"",
        metricDimensions: "4.2m × 3.8m",
        areaSqFt: 175,
        sqFt: 175,
        x: 44,
        y: 28,
        w: 22,
        h: 20,
        type: "living",
        doors: [{ x: 44, y: 38, orientation: "left" }],
        windows: [{ x: 55, y: 28, orientation: "top" }],
        ventilation: "Atrium Facing",
        recommendedTrade: "Acoustic Wall Paneling",
        isEnSuite: false,
      },
      // Staircase Core - EXACT identical coordinates to Ground Floor
      {
        id: `fl${lvl}-stairs`,
        name: "Staircase Landing & Lift Foyer",
        label: "Staircase Landing & Lift Foyer",
        dimensions: "10'0\" × 14'0\"",
        metricDimensions: "3.0m × 4.2m",
        areaSqFt: 140,
        sqFt: 140,
        x: STAIRCASE_CORE.x,
        y: STAIRCASE_CORE.y,
        w: STAIRCASE_CORE.w,
        h: STAIRCASE_CORE.h,
        type: "stairs",
        doors: [{ x: 48, y: 60, orientation: "left" }],
        windows: [{ x: 55, y: 72, orientation: "bottom" }],
        ventilation: "Lightwell Shaft",
        recommendedTrade: "Structural Steel & Timber",
        isEnSuite: false,
      },
      // Second En-Suite Bedroom
      {
        id: `fl${lvl}-bed-2`,
        name: `Suite 02 (${label})`,
        label: `Suite 02 (${label})`,
        dimensions: `${Math.round(widthNum * 0.38)}' × ${Math.round(depthNum * 0.28)}'`,
        metricDimensions: "3.8m × 3.4m",
        areaSqFt: Math.round(plotSqFt * 0.16),
        sqFt: Math.round(plotSqFt * 0.16),
        x: 6,
        y: 56,
        w: 38,
        h: 24,
        type: "bedroom",
        doors: [{ x: 44, y: 66, orientation: "right" }],
        windows: [{ x: 6, y: 68, orientation: "left" }],
        ventilation: "Cross-Ventilated",
        recommendedTrade: "Integrated Wardrobe Units",
        isEnSuite: true,
      },
      // Attached Washroom for Suite 02
      {
        id: `fl${lvl}-bath-2`,
        name: "En-Suite Bath 02",
        label: "En-Suite Bath 02",
        dimensions: "8'0\" × 6'0\"",
        metricDimensions: "2.4m × 1.8m",
        areaSqFt: 48,
        sqFt: 48,
        x: 64,
        y: 48,
        w: 16,
        h: 18,
        type: "bath",
        doors: [{ x: 64, y: 56, orientation: "left" }],
        windows: [{ x: 80, y: 56, orientation: "right" }],
        ventilation: "Stacked Plumbing Shaft",
        recommendedTrade: "Sanitary Plumber",
        isEnSuite: true,
      },
    ];

    // If BHK >= 3, add third en-suite bedroom on this floor
    if (bhkNum >= 3) {
      upperRooms.push({
        id: `fl${lvl}-bed-3`,
        name: `Suite 03 (${label})`,
        label: `Suite 03 (${label})`,
        dimensions: "13'0\" × 12'0\"",
        metricDimensions: "3.9m × 3.6m",
        areaSqFt: 156,
        sqFt: 156,
        x: 6,
        y: 82,
        w: 38,
        h: 15,
        type: "bedroom",
        doors: [{ x: 44, y: 88, orientation: "right" }],
        windows: [{ x: 22, y: 97, orientation: "bottom" }],
        ventilation: "South Garden View",
        recommendedTrade: "Study & Joinery",
        isEnSuite: true,
      });

      upperRooms.push({
        id: `fl${lvl}-bath-3`,
        name: "En-Suite Bath 03",
        label: "En-Suite Bath 03",
        dimensions: "7'6\" × 5'0\"",
        metricDimensions: "2.3m × 1.5m",
        areaSqFt: 38,
        sqFt: 38,
        x: 64,
        y: 72,
        w: 16,
        h: 18,
        type: "bath",
        doors: [{ x: 64, y: 80, orientation: "left" }],
        windows: [{ x: 80, y: 80, orientation: "right" }],
        ventilation: "Stacked Plumbing Shaft",
        recommendedTrade: "Sanitary Plumber",
        isEnSuite: true,
      });
    }

    const flTotalSqFt = Math.round(plotSqFt * 0.84);
    generatedFloors.push({
      level: lvl,
      label,
      builtUpAreaSqFt: flTotalSqFt,
      carpetAreaSqFt: Math.round(flTotalSqFt * 0.8),
      totalSqFt: flTotalSqFt,
      staircase: STAIRCASE_CORE,
      rooms: upperRooms,
      northAngleDeg: northAngle,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. PENTHOUSE (Optional top floor)
  // Master Suite, Lounge, Open Terrace, Pantry, Staircase headroom
  // ───────────────────────────────────────────────────────────────────────────
  if (hasPenthouse) {
    const penthouseRooms = [
      {
        id: "ph-master-suite",
        name: "Penthouse Presidential Suite",
        label: "Penthouse Presidential Suite",
        dimensions: `${Math.round(widthNum * 0.45)}' × ${Math.round(depthNum * 0.32)}'`,
        metricDimensions: "4.6m × 4.4m",
        areaSqFt: Math.round(plotSqFt * 0.22),
        sqFt: Math.round(plotSqFt * 0.22),
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
        recommendedTrade: "Luxury Millwork & Leather Cladding",
        isEnSuite: true,
      },
      {
        id: "ph-bath",
        name: "Open-Air Jacuzzi & Spa Bath",
        label: "Open-Air Jacuzzi & Spa Bath",
        dimensions: "12'0\" × 8'0\"",
        metricDimensions: "3.6m × 2.4m",
        areaSqFt: 96,
        sqFt: 96,
        x: 66,
        y: 8,
        w: 28,
        h: 22,
        type: "bath",
        doors: [{ x: 66, y: 18, orientation: "left" }],
        windows: [{ x: 80, y: 8, orientation: "top" }],
        ventilation: "Skylight & Stack",
        recommendedTrade: "Premium Wellness Plumbing",
        isEnSuite: true,
      },
      {
        id: "ph-lounge",
        name: "Sky Lounge & Cocktail Bar",
        label: "Sky Lounge & Cocktail Bar",
        dimensions: "16'0\" × 14'0\"",
        metricDimensions: "4.8m × 4.2m",
        areaSqFt: 224,
        sqFt: 224,
        x: 6,
        y: 44,
        w: 40,
        h: 26,
        type: "living",
        doors: [{ x: 46, y: 54, orientation: "right" }],
        windows: [{ x: 6, y: 56, orientation: "left" }],
        ventilation: "Terrace Deck Connect",
        recommendedTrade: "Acoustic Millwork",
        isEnSuite: false,
      },
      {
        id: "ph-pantry",
        name: "Gourmet Penthouse Pantry",
        label: "Gourmet Penthouse Pantry",
        dimensions: "10'0\" × 7'0\"",
        metricDimensions: "3.0m × 2.1m",
        areaSqFt: 70,
        sqFt: 70,
        x: 66,
        y: 32,
        w: 22,
        h: 16,
        type: "kitchen",
        doors: [{ x: 66, y: 40, orientation: "left" }],
        windows: [{ x: 88, y: 40, orientation: "right" }],
        ventilation: "Vertical Wet Wall",
        recommendedTrade: "Custom Quartz Joinery",
        isEnSuite: false,
      },
      // Staircase Core - Headroom level, EXACT same coordinates
      {
        id: "ph-stairs",
        name: "Staircase Headroom Core",
        label: "Staircase Headroom Core",
        dimensions: "10'0\" × 14'0\"",
        metricDimensions: "3.0m × 4.2m",
        areaSqFt: 140,
        sqFt: 140,
        x: STAIRCASE_CORE.x,
        y: STAIRCASE_CORE.y,
        w: STAIRCASE_CORE.w,
        h: STAIRCASE_CORE.h,
        type: "stairs",
        doors: [{ x: 48, y: 60, orientation: "left" }],
        windows: [{ x: 55, y: 72, orientation: "bottom" }],
        ventilation: "Roof Headroom Glazing",
        recommendedTrade: "Structural Steel Enclosure",
        isEnSuite: false,
      },
      // Expansive Sky Terrace
      {
        id: "ph-terrace",
        name: "Pergola Sky Deck & Landscape Terrace",
        label: "Pergola Sky Deck & Landscape Terrace",
        dimensions: `${Math.round(widthNum * 0.7)}' × ${Math.round(depthNum * 0.3)}'`,
        metricDimensions: "6.8m × 4.2m",
        areaSqFt: Math.round(plotSqFt * 0.32),
        sqFt: Math.round(plotSqFt * 0.32),
        x: 6,
        y: 72,
        w: 88,
        h: 24,
        type: "terrace",
        doors: [{ x: 46, y: 72, orientation: "top" }],
        windows: [],
        ventilation: "360° Open Sky",
        recommendedTrade: "Weatherproof Composite Decking",
        isEnSuite: false,
      },
    ];

    const phTotalSqFt = Math.round(plotSqFt * 0.65);
    generatedFloors.push({
      level: 99,
      label: "Penthouse",
      builtUpAreaSqFt: phTotalSqFt,
      carpetAreaSqFt: Math.round(phTotalSqFt * 0.75),
      totalSqFt: phTotalSqFt,
      staircase: STAIRCASE_CORE,
      rooms: penthouseRooms,
      northAngleDeg: northAngle,
    });
  }

  const totalBuiltUpAreaSqFt = generatedFloors.reduce(
    (acc, f) => acc + (f.totalSqFt || f.builtUpAreaSqFt || 0),
    0
  );

  return {
    floorsCount: generatedFloors.length,
    hasPenthouse: Boolean(hasPenthouse),
    totalBuiltUpAreaSqFt,
    floors: generatedFloors,
    // Root level rooms for backward compatibility
    rooms: generatedFloors[0].rooms,
  };
}

export default {
  parseFloorsCount,
  parseBhkNum,
  generateMultiFloorLayout,
};
