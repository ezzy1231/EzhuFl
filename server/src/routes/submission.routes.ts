import { Router } from "express";
import {
  authMiddleware,
  influencerOnly,
  verifiedInfluencerOnly,
} from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validation.js";
import {
  createSubmission,
  refreshSubmission,
  refreshCampaignSubmissions,
} from "../controllers/submission.controller.js";
import {
  createSubmissionSchema,
  submissionIdParamsSchema,
  campaignSubmissionParamsSchema,
} from "../validation/submission.validation.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  influencerOnly,
  verifiedInfluencerOnly,
  validateBody(createSubmissionSchema),
  createSubmission
);

// Refresh metrics for a single submission
router.post(
  "/:id/refresh",
  authMiddleware,
  validateParams(submissionIdParamsSchema),
  refreshSubmission
);

// Refresh all submissions in a campaign
router.post(
  "/campaign/:campaignId/refresh",
  authMiddleware,
  validateParams(campaignSubmissionParamsSchema),
  refreshCampaignSubmissions
);

export default router;
