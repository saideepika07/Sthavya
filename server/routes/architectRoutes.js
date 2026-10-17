import express from "express";
import { getArchitects, getArchitectById } from "../controllers/architectController.js";

const router = express.Router();

router.get("/", getArchitects);
router.get("/:id", getArchitectById);

export default router;
