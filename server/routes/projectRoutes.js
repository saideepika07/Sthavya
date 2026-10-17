import express from "express";
import {
  saveProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(optionalAuth, saveProject)
  .get(optionalAuth, getProjects);

router.route("/:id")
  .get(getProjectById)
  .put(optionalAuth, updateProject)
  .delete(optionalAuth, deleteProject);

export default router;
