import { Router } from "express";
import {
  authMiddleware,
  businessOnly,
  influencerOnly,
  verifiedBusinessOnly,
  verifiedInfluencerOnly,
} from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validation.js";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getMyCampaigns,
  joinCampaign,
  getJoinedCampaigns,
  checkJoined,
  completeCampaign,
} from "../controllers/campaign.controller.js";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";
import {
  campaignIdParamsSchema,
  createCampaignSchema,
} from "../validation/campaign.validation.js";

const router = Router();

// Public — list all campaigns (no auth needed for landing page)
router.get("/", getAllCampaigns);

// Business-only — my campaigns
router.get("/my", authMiddleware, businessOnly, getMyCampaigns);

// Influencer-only — campaigns the user has joined
router.get("/joined", authMiddleware, influencerOnly, getJoinedCampaigns);

// Must come after /my and /joined to avoid treating them as :id
router.get("/:id", authMiddleware, validateParams(campaignIdParamsSchema), getCampaignById);

// Business-only — create campaign (MUST be verified/approved)
router.post(
  "/",
  authMiddleware,
  businessOnly,
  verifiedBusinessOnly,
  validateBody(createCampaignSchema),
  createCampaign
);

// Influencer-only — join a campaign
router.post(
  "/:id/join",
  authMiddleware,
  influencerOnly,
  verifiedInfluencerOnly,
  validateParams(campaignIdParamsSchema),
  joinCampaign
);

// Check if user has joined a campaign
router.get("/:id/joined", authMiddleware, validateParams(campaignIdParamsSchema), checkJoined);

// Leaderboard (authenticated)
router.get("/:id/leaderboard", authMiddleware, validateParams(campaignIdParamsSchema), getLeaderboard);

// Complete a campaign and award winners (business owner or admin)
router.post("/:id/complete", authMiddleware, validateParams(campaignIdParamsSchema), completeCampaign);

export default router;
