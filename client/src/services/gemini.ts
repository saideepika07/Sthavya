// STHAVYA Gemini AI Service for Spatial Planning & Interior Generation
// Pure server-routed architecture: All AI calls execute securely on Express backend (/api/ai)
import { aiApi } from "./api";

export interface BlueprintModification {
  id: string;
  zone: string;
  action: string;
  sqFtGained: string;
  trade: string;
}

export interface RedesignedRoomPlan {
  id: string;
  label: string;
  dimensions: string;
  sqFt: number;
  spaceFeature: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface RoomAnalysisResult {
  isBlueprint?: boolean;
  architecturalStyle: string;
  lightingCondition: string;
  spatialDiagnostic: string;
  spaceSavingOpportunities: string[];
  recommendedPalette: { name: string; hex: string }[];
  suggestedItems: {
    id: string;
    title: string;
    dimensions: string;
    spaceFeature: string;
    craftsman: string;
    x: number;
    y: number;
  }[];
  blueprintModifications?: BlueprintModification[];
  redesignedRooms?: RedesignedRoomPlan[];
  totalSqFtGained?: string;
  blueprintDiagramUrl?: string;
  isFallback?: boolean;
}

export interface FloorPlanAuditResult {
  overallScore: number;
  circulationRating: "Optimal" | "Moderate" | "Needs Revision";
  structuralInsights: string[];
  costOptimizationTips: string[];
  recommendedTrades: { trade: string; reason: string }[];
  vastuNotes?: string;
  isFallback?: boolean;
}

export interface EnhancedPromptResult {
  enhancedPrompt: string;
  architecturalStyle: string;
  spatialIntent: string;
  suggestedLighting: string;
  suggestedMaterials: string[];
  estimatedComplexity: "Standard" | "Advanced" | "Masterpiece";
}

/**
 * Analyze an uploaded room photo or blueprint via Express backend AI route
 * (No browser API key; no silent mock fallback)
 */
export async function analyzeRoomImage(
  base64Data: string,
  mimeType: string = "image/jpeg",
  roomContext: string = "space photo or architectural blueprint"
): Promise<RoomAnalysisResult> {
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

  try {
    const data = await aiApi.analyzeRoom(cleanBase64, mimeType, roomContext);
    if (!data?.success || !data?.result) {
      throw new Error(data?.message || "Invalid response from spatial analysis engine.");
    }
    return data.result as RoomAnalysisResult;
  } catch (error: any) {
    console.error("Spatial AI Analysis Error:", error);
    throw new Error(
      error?.message || "Spatial analysis service unavailable. Please check that GEMINI_API_KEY is configured on the backend."
    );
  }
}

/**
 * Enhance an architectural prompt via Express backend AI route
 */
export async function enhanceSpatialPrompt(
  prompt: string,
  style = "Contemporary Minimalist",
  roomType = "Living Room"
): Promise<EnhancedPromptResult> {
  try {
    const data = await aiApi.enhancePrompt(prompt, style, roomType);
    if (!data?.success || !data?.result) {
      throw new Error(data?.message || "Failed to generate enhanced prompt.");
    }
    return data.result as EnhancedPromptResult;
  } catch (error: any) {
    console.error("AI Prompt Enhancement Error:", error);
    throw new Error(error?.message || "Prompt enhancement service unreachable.");
  }
}

/**
 * Enhance and synthesize an interior prompt with Gemini via backend
 */
export async function enhanceInteriorPrompt(
  userNotes: string,
  style: string,
  roomType = "Living Room",
  dimensions?: string,
  budgetTier?: string
): Promise<{ enhancedPrompt: string; designSummary: string }> {
  const notesWithContext = [
    userNotes,
    dimensions ? `Dimensions: ${dimensions}` : "",
    budgetTier ? `Budget Tier: ${budgetTier}` : "",
  ].filter(Boolean).join(". ");

  const res = await enhanceSpatialPrompt(notesWithContext, style, roomType);
  return {
    enhancedPrompt: res.enhancedPrompt,
    designSummary: res.spatialIntent,
  };
}

/**
 * Generate a photorealistic interior image based on prompt & style
 */
export function generateInteriorImageUrl(
  prompt: string,
  style: string,
  seed?: number
): string {
  const safeSeed = seed || Math.floor(Math.random() * 900000) + 100000;
  const cleanedPrompt = encodeURIComponent(
    `architectural interior photograph, ${style} interior design, ${prompt}, ultra realistic, 8k resolution, cinematic natural lighting, interior design magazine style, masterpiece`
  );
  return `https://image.pollinations.ai/prompt/${cleanedPrompt}?width=1280&height=854&seed=${safeSeed}&nologo=true&enhance=true`;
}

/**
 * Generate a 2D architectural blueprint CAD floor plan render
 */
export function generateBlueprintImageUrl(
  prompt: string,
  seed?: number
): string {
  const safeSeed = seed || Math.floor(Math.random() * 900000) + 100000;
  const cleanedPrompt = encodeURIComponent(
    `architectural 2D blueprint floor plan, CAD schematic top down drawing, space saving redesigned layout, clean white background with crisp black architectural walls and green space-saving annotations, 2D technical layout, detailed dimensions, pocket doors, high resolution`
  );
  return `https://image.pollinations.ai/prompt/${cleanedPrompt}?width=1280&height=854&seed=${safeSeed}&nologo=true&enhance=true`;
}

/**
 * Audit a 2D floor plan layout via Express backend AI route
 */
export async function auditFloorPlanWithAI(planInfo: {
  width: string;
  depth: string;
  floors: string;
  budget: string;
  style: string;
  region: string;
  facing?: string;
  parking?: string;
  bhk?: string;
  rooms: { label: string; sqFt: number; dimensions?: string }[];
}): Promise<FloorPlanAuditResult> {
  try {
    const data = await aiApi.auditFloorPlan(planInfo);
    if (!data?.success || !data?.result) {
      throw new Error(data?.message || "Failed to audit floor plan.");
    }
    return data.result as FloorPlanAuditResult;
  } catch (error: any) {
    console.error("AI Floor Plan Audit Error:", error);
    throw new Error(error?.message || "Floor plan architectural audit service unreachable.");
  }
}

// Backward-compatibility alias
export const auditFloorPlanWithGemini = auditFloorPlanWithAI;

export default {
  analyzeRoomImage,
  enhanceSpatialPrompt,
  auditFloorPlanWithAI,
  auditFloorPlanWithGemini,
};
