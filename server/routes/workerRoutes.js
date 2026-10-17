import express from "express";
import { getWorkers, getWorkerById } from "../controllers/workerController.js";

const router = express.Router();

router.get("/", getWorkers);
router.get("/:id", getWorkerById);

export default router;
