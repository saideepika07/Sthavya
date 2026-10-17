import express from "express";
import {
  analyzeRoom,
  enhancePrompt,
  auditFloorPlan,
  generateMultiFloorPlan,
} from "../controllers/aiController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "STHAVYA Gemini Spatial AI Gateway",
    status: "operational",
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    configured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI endpoints
router.post("/analyze-room", requireAuth, analyzeRoom);
router.post("/enhance-prompt", requireAuth, enhancePrompt);
router.post("/audit-floorplan", requireAuth, auditFloorPlan);
router.post("/generate-multifloor", optionalAuth, generateMultiFloorPlan);

export default router;
