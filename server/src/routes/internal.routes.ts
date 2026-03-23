import { Router } from "express";
import { completeExpiredCampaignsJob } from "../controllers/internal.controller.js";
import { cronSecretMiddleware } from "../middleware/internal.js";

const router = Router();

router.get(
  "/cron/complete-expired-campaigns",
  cronSecretMiddleware,
  completeExpiredCampaignsJob
);

export default router;