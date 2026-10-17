import express from "express";
import {
  createHousePlan,
  getHousePlans,
  getHousePlanById,
  updateHousePlan,
  deleteHousePlan,
} from "../controllers/housePlanController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(requireAuth, createHousePlan)
  .get(optionalAuth, getHousePlans);

router.route("/:id")
  .get(optionalAuth, getHousePlanById)
  .put(requireAuth, updateHousePlan)
  .delete(requireAuth, deleteHousePlan);

export default router;
