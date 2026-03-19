import { Router } from "express";
import { getStats } from "../controllers/stats.controller.js";

const router = Router();

// Public — no auth required
router.get("/", getStats);

export default router;
