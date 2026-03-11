import { Router } from "express";
import {
  authMiddleware,
  businessOnly,
  influencerOnly,
  verifiedBusinessOnly,
} from "../middleware/auth.js";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getMyCampaigns,
  joinCampaign,
  getJoinedCampaigns,
  checkJoined,
} from "../controllers/campaign.controller.js";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const router = Router();

// Public-ish (still needs auth) — list / details
router.get("/", authMiddleware, getAllCampaigns);

// Business-only — my campaigns
router.get("/my", authMiddleware, businessOnly, getMyCampaigns);

// Influencer-only — campaigns the user has joined
router.get("/joined", authMiddleware, influencerOnly, getJoinedCampaigns);

// Must come after /my and /joined to avoid treating them as :id
router.get("/:id", authMiddleware, getCampaignById);

// Business-only — create campaign (MUST be verified/approved)
router.post("/", authMiddleware, businessOnly, verifiedBusinessOnly, createCampaign);

// Influencer-only — join a campaign
router.post("/:id/join", authMiddleware, influencerOnly, joinCampaign);

// Check if user has joined a campaign
router.get("/:id/joined", authMiddleware, checkJoined);

// Leaderboard (authenticated)
router.get("/:id/leaderboard", authMiddleware, getLeaderboard);

export default router;
