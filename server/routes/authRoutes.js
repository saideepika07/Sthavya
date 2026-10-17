import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);

// Backward-compatibility alias for sync
router.post("/sync", registerUser);

export default router;
