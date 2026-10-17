import { z } from "zod";

// Read Gemini key ONLY from server environment
const getApiKey = () => (process.env.GEMINI_API_KEY || "").trim();
const getModel = () => (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();
const FALLBACK_MODEL = "gemini-1.5-flash";
const TIMEOUT_MS = 45000;

// ─── ZOD SCHEMAS FOR STRICT AI VALIDATION ────────────────────────────────────

export const RoomAnalysisSchema = z.object({
  isBlueprint: z.boolean().default(false),
  architecturalStyle: z.string().default("Modern Residential"),
  lightingCondition: z.string().default("Natural daylit"),
  spatialDiagnostic: z.string().min(10),
  spaceSavingOpportunities: z.array(z.string()).default([]),
  recommendedPalette: z
    .array(
      z.object({
        name: z.string(),
        hex: z.string(),
      })
    )
    .default([]),
  suggestedItems: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        dimensions: z.string(),
        spaceFeature: z.string(),
        craftsman: z.string(),
        x: z.number(),
        y: z.number(),
      })
    )
    .default([]),
  blueprintModifications: z
    .array(
      z.object({
        id: z.string(),
        zone: z.string(),
        action: z.string(),
        sqFtGained: z.string(),
        trade: z.string(),
      })
    )
    .optional(),
  redesignedRooms: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        dimensions: z.string(),
        sqFt: z.number(),
        spaceFeature: z.string(),
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number(),
        color: z.string(),
      })
    )
    .optional(),
  totalSqFtGained: z.string().optional(),
});

export const EnhancePromptSchema = z.object({
  enhancedPrompt: z.string().min(10),
  architecturalStyle: z.string(),
  spatialIntent: z.string(),
  suggestedLighting: z.string(),
  suggestedMaterials: z.array(z.string()),
  estimatedComplexity: z.enum(["Standard", "Advanced", "Masterpiece"]).default("Advanced"),
});

export const FloorPlanAuditSchema = z.object({
  overallScore: z.number().min(0).max(100),
  circulationRating: z.enum(["Optimal", "Moderate", "Needs Revision"]).default("Optimal"),
  structuralInsights: z.array(z.string()).min(1),
  costOptimizationTips: z.array(z.string()).min(1),
  recommendedTrades: z
    .array(
      z.object({
        trade: z.string(),
        reason: z.string(),
      })
    )
    .min(1),
  vastuNotes: z.string().optional(),
});

// ─── GEMINI CALLER WITH RETRY ────────────────────────────────────────────────

async function executeGeminiRequest(payload, targetModel = getModel(), isRetry = false) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured on the server. Please set it in server/.env or Render dashboard.");
    error.statusCode = 503;
    error.code = "AI_KEY_MISSING";
    throw error;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (netErr) {
    if (!isRetry) {
      console.warn(`Gemini request to ${targetModel} failed (${netErr.message}). Retrying once with ${FALLBACK_MODEL}...`);
      return executeGeminiRequest(payload, FALLBACK_MODEL, true);
    }
    const err = new Error(`Gemini connection timed out or failed: ${netErr.message}`);
    err.statusCode = 504;
    throw err;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    if (!isRetry && targetModel !== FALLBACK_MODEL) {
      console.warn(`Gemini model ${targetModel} responded with ${response.status}. Retrying with ${FALLBACK_MODEL}...`);
      return executeGeminiRequest(payload, FALLBACK_MODEL, true);
    }
    const error = new Error(`Gemini API error (${response.status}): ${errorBody.slice(0, 300)}`);
    error.statusCode = 502;
    throw error;
  }

  return await response.json();
}

/**
 * Extracts and cleans JSON from Gemini candidate response
 */
function extractJsonFromGemini(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty candidate payload.");

  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstOpen = cleaned.indexOf("{");
    const lastClose = cleaned.lastIndexOf("}");
    if (firstOpen === -1 || lastClose <= firstOpen) {
      throw new Error("Unable to parse structured JSON from Gemini response.");
    }
    return JSON.parse(cleaned.slice(firstOpen, lastClose + 1));
  }
}

// ─── AI CONTROLLER HANDLERS ──────────────────────────────────────────────────

/**
 * @desc    Analyze room photo or blueprint with Gemini Vision
 * @route   POST /api/ai/analyze-room
 * @access  Private (Authenticated)
 */
export const analyzeRoom = async (req, res) => {
  try {
    const { base64Data, mimeType = "image/jpeg", roomContext = "space photo or architectural blueprint" } = req.body;

    if (!base64Data || typeof base64Data !== "string") {
      return res.status(400).json({ success: false, message: "base64Data image string is required." });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

    const prompt = `You are a master chief architect and spatial optimizer.
Carefully examine this uploaded image. Determine whether it is:
1) An architectural 2D blueprint / floor plan / CAD layout (with walls, doors, room labels, top-down view), OR
2) A photograph of an interior 3D room. Context: ${roomContext}.

CRITICAL INSTRUCTION:
If it is a 2D floor plan or blueprint, set "isBlueprint": true. You MUST generate a full 2D space-saving REDESIGNED BLUEPRINT layout with redesigned rooms (coordinates in an imaginary 480x360 canvas: x, y, w, h), specific wall removals, pocket sliding door placements, and exact square footage gained!

Respond with a STRICT JSON OBJECT (no markdown ticks, no commentary outside JSON) matching this schema:
{
  "isBlueprint": true or false,
  "architecturalStyle": "e.g. 2-Bedroom Residential Blueprint or Contemporary Minimalist",
  "lightingCondition": "e.g. Dual-aspect window exposure / Natural daylit",
  "spatialDiagnostic": "A concise architectural evaluation of bottlenecks, wall clearances, and circulation flow in this layout.",
  "spaceSavingOpportunities": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "recommendedPalette": [
    {"name": "Color Name", "hex": "#HEX"}
  ],
  "suggestedItems": [
    {
      "id": "tag-1",
      "title": "Item Name",
      "dimensions": "Dimensions",
      "spaceFeature": "Space saving feature",
      "craftsman": "Trade required",
      "x": 35,
      "y": 48
    }
  ],
  "blueprintModifications": [
    {
      "id": "mod-1",
      "zone": "Zone Name",
      "action": "Description of modification",
      "sqFtGained": "+22 sq ft",
      "trade": "Civil Contractor"
    }
  ],
  "redesignedRooms": [
    {
      "id": "r1",
      "label": "Open Great Room",
      "dimensions": "20' × 15'",
      "sqFt": 300,
      "spaceFeature": "Circulation notes",
      "x": 24,
      "y": 24,
      "w": 250,
      "h": 170,
      "color": "#E8F5E9"
    }
  ],
  "totalSqFtGained": "+52 sq ft Reclaimed"
}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    };

    const rawData = await executeGeminiRequest(payload);
    const parsed = extractJsonFromGemini(rawData);

    // Validate with Zod
    const validated = RoomAnalysisSchema.parse(parsed);

    res.json({
      success: true,
      result: validated,
      modelUsed: getModel(),
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.name === "ZodError" ? 422 : 500);
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to analyze room image.",
      details: error.name === "ZodError" ? error.errors : undefined,
    });
  }
};

/**
 * @desc    Enhance architectural prompt
 * @route   POST /api/ai/enhance-prompt
 * @access  Private (Authenticated)
 */
export const enhancePrompt = async (req, res) => {
  try {
    const { prompt, style = "Contemporary Minimalist", roomType = "Living Room" } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "A prompt string with at least 3 characters is required.",
      });
    }

    const systemPrompt = `You are an elite architectural consultant and spatial interior designer.
Transform the user's initial spatial idea into an exquisitely detailed architectural prompt.
Initial Idea: "${prompt}"
Design Style: "${style}"
Room Context: "${roomType}"

Respond with a STRICT JSON OBJECT (no markdown ticks, no commentary outside JSON):
{
  "enhancedPrompt": "Highly descriptive, sensorially rich spatial design prompt including materials, aperture openings, joinery, and lighting.",
  "architecturalStyle": "${style}",
  "spatialIntent": "Core design thesis in one sentence",
  "suggestedLighting": "Lighting strategy description",
  "suggestedMaterials": ["Material 1", "Material 2", "Material 3"],
  "estimatedComplexity": "Standard" | "Advanced" | "Masterpiece"
}`;

    const payload = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    };

    const rawData = await executeGeminiRequest(payload);
    const parsed = extractJsonFromGemini(rawData);
    const validated = EnhancePromptSchema.parse(parsed);

    res.json({
      success: true,
      result: validated,
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.name === "ZodError" ? 422 : 500);
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to enhance prompt.",
      details: error.name === "ZodError" ? error.errors : undefined,
    });
  }
};

/**
 * @desc    Audit a 2D floor plan layout
 * @route   POST /api/ai/audit-floorplan
 * @access  Private (Authenticated)
 */
export const auditFloorPlan = async (req, res) => {
  try {
    const planInfo = req.body;

    if (!planInfo || !planInfo.rooms || !Array.isArray(planInfo.rooms)) {
      return res.status(400).json({
        success: false,
        message: "planInfo with an array of configured rooms is required.",
      });
    }

    const prompt = `You are a veteran Chief Architect reviewing this 2D house blueprint:
- Typology: ${planInfo.bhk || "2 BHK"}
- Plot: ${planInfo.width || "30"} ft × ${planInfo.depth || "45"} ft (${planInfo.floors || "G+1"} floors)
- Style: ${planInfo.style || "Modern"}
- Region: ${planInfo.region || "Bangalore"}
- Budget: ${planInfo.budget || "₹35 Lakhs"}
- Plot Facing / Vastu: ${planInfo.facing || "North Facing"}
- Parking Spec: ${planInfo.parking || "1 Car + 2 Bikes Porch"}
- Configured Rooms: ${JSON.stringify(planInfo.rooms)}

Provide a strict JSON response conforming to this exact schema (no markdown, pure JSON):
{
  "overallScore": 92,
  "circulationRating": "Optimal",
  "structuralInsights": [
    "Insight on load-bearing or plumbing stack alignment",
    "Insight on cross-ventilation or natural light capture"
  ],
  "costOptimizationTips": [
    "Tip on cost efficiency for this layout",
    "Tip on modular partition or MEP savings"
  ],
  "recommendedTrades": [
    {"trade": "Turnkey Civil Contractor", "reason": "Reason for trade"},
    {"trade": "Master Sanitary Plumber", "reason": "Reason for trade"},
    {"trade": "Master Modular Carpenter", "reason": "Reason for trade"}
  ],
  "vastuNotes": "Positive guidance on entrance, wet wall, and kitchen orientation"
}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    };

    const rawData = await executeGeminiRequest(payload);
    const parsed = extractJsonFromGemini(rawData);
    const validated = FloorPlanAuditSchema.parse(parsed);

    res.json({
      success: true,
      result: validated,
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.name === "ZodError" ? 422 : 500);
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to audit floor plan.",
      details: error.name === "ZodError" ? error.errors : undefined,
    });
  }
};

export const MultiFloorBlueprintSchema = z.object({
  floorsCount: z.number().min(1),
  hasPenthouse: z.boolean().default(false),
  totalBuiltUpAreaSqFt: z.number().min(100),
  floors: z.array(
    z.object({
      level: z.number(),
      label: z.string(),
      builtUpAreaSqFt: z.number().optional(),
      carpetAreaSqFt: z.number().optional(),
      totalSqFt: z.number().optional(),
      staircase: z
        .object({
          x: z.number(),
          y: z.number(),
          w: z.number(),
          h: z.number(),
          direction: z.string().optional(),
        })
        .optional(),
      rooms: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          dimensions: z.string(),
          metricDimensions: z.string().optional(),
          areaSqFt: z.number(),
          sqFt: z.number().optional(),
          x: z.number(),
          y: z.number(),
          w: z.number(),
          h: z.number(),
          type: z.string().default("bedroom"),
          doors: z.array(z.any()).optional(),
          windows: z.array(z.any()).optional(),
          ventilation: z.string().optional(),
          isEnSuite: z.boolean().optional(),
        })
      ),
    })
  ),
});

/**
 * @desc Generate multi-floor architectural layout with AI (Gemini) + Zod validation,
 * with automatic fallback to structural rule-based generator
 * @route POST /api/ai/generate-multifloor
 * @access Optional / Protected
 */
export const generateMultiFloorPlan = async (req, res) => {
  const {
    width = 30,
    depth = 45,
    bhk = "3 BHK",
    floors = "G+1",
    facing = "East",
    hasPenthouse = false,
    style = "Modern",
    budget = "₹48 Lakhs",
  } = req.body || {};

  const { generateMultiFloorLayout } = await import("../utils/multiFloorGenerator.js");

  // If Gemini API Key is present, attempt AI generation with Zod validation
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const prompt = `You are a Principal CAD Architect designing a complete multi-floor residential blueprint set for STHAVYA:
- Dimensions: ${width} ft frontage × ${depth} ft depth
- Typology: ${bhk} per floor
- Total Floors: ${floors} ${hasPenthouse ? "PLUS Top Penthouse Floor" : ""}
- Road Facing / Vastu: ${facing} Facing
- Architectural Style: ${style}
- Budget Target: ${budget}

RULES:
1. Generate one floor object per level: Ground Floor, 1st Floor, ..., up to selected top floor${hasPenthouse ? ", plus Penthouse" : ""}.
2. Staircase must be in identical (x, y, w, h) coordinates on every floor.
3. Wet areas (kitchen, attached bathrooms) must stack vertically across floors for plumbing alignment.
4. Ground floor: parking, foyer, living, dining, kitchen, utility, staircase, and guest bedroom with attached bath when BHK > 1.
5. Upper floors: bedrooms with 100% attached washrooms, family lounge, sit-out balcony.
6. Penthouse: master suite, lounge, terrace deck, pantry.
7. Coordinates (x, y, w, h) must be percentage numbers 0-100 and fill the plot boundary without gaps.

Provide strict JSON conforming to:
{
  "floorsCount": number,
  "hasPenthouse": boolean,
  "totalBuiltUpAreaSqFt": number,
  "floors": [
    {
      "level": 0,
      "label": "Ground Floor",
      "builtUpAreaSqFt": number,
      "carpetAreaSqFt": number,
      "totalSqFt": number,
      "staircase": {"x": 48, "y": 50, "w": 14, "h": 22, "direction": "UP & DN"},
      "rooms": [
        {
          "id": "gf-living",
          "name": "Living Lounge",
          "dimensions": "16'0\\" × 14'0\\"",
          "areaSqFt": 224,
          "x": 6,
          "y": 40,
          "w": 40,
          "h": 32,
          "type": "living",
          "isEnSuite": false
        }
      ]
    }
  ]
}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      };

      const rawData = await executeGeminiRequest(payload);
      const parsed = extractJsonFromGemini(rawData);
      const validated = MultiFloorBlueprintSchema.parse(parsed);

      return res.json({
        success: true,
        source: "gemini-ai",
        data: validated,
      });
    } catch (aiErr) {
      console.warn("Gemini multi-floor generation failed or invalid. Falling back to structural rule engine:", aiErr.message);
    }
  }

  // Robust Rule-Based Generator Fallback
  const fallbackData = generateMultiFloorLayout({
    width,
    depth,
    bhk,
    floors,
    facing,
    hasPenthouse,
    style,
  });

  res.json({
    success: true,
    source: "structural-engine",
    data: fallbackData,
  });
};

export default { analyzeRoom, enhancePrompt, auditFloorPlan, generateMultiFloorPlan };
