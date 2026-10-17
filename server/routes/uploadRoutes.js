import express from "express";
import {
  uploadBlueprint,
  uploadInteriorImage,
  getFile,
} from "../controllers/uploadController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/blueprint", optionalAuth, upload.single("file"), uploadBlueprint);
router.post("/interior", optionalAuth, upload.single("file"), uploadInteriorImage);
router.get("/file/:filename", getFile);

export default router;
