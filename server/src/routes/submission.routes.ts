import { Router } from "express";
import { authMiddleware, influencerOnly } from "../middleware/auth.js";
import {
  createSubmission,
  refreshSubmission,
  refreshCampaignSubmissions,
} from "../controllers/submission.controller.js";

const router = Router();

router.post("/", authMiddleware, influencerOnly, createSubmission);

// Refresh metrics for a single submission
router.post("/:id/refresh", authMiddleware, refreshSubmission);

// Refresh all submissions in a campaign
router.post("/campaign/:campaignId/refresh", authMiddleware, refreshCampaignSubmissions);

export default router;
