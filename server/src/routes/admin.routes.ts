import { Router } from "express";
import { authMiddleware, adminOnly } from "../middleware/auth.js";
import {
  getAdminStats,
  getBusinesses,
  getPendingBusinesses,
  getBusinessDetail,
  reviewBusiness,
  suspendBusiness,
  getInfluencers,
  getInfluencerDetail,
  reviewInfluencer,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminOnly);

// Dashboard
router.get("/stats", getAdminStats);

// Business verification
router.get("/businesses", getBusinesses);
router.get("/businesses/pending", getPendingBusinesses);
router.get("/businesses/:id", getBusinessDetail);
router.post("/businesses/:id/review", reviewBusiness);
router.post("/businesses/:id/suspend", suspendBusiness);

// Influencer verification
router.get("/influencers", getInfluencers);
router.get("/influencers/:id", getInfluencerDetail);
router.post("/influencers/:id/review", reviewInfluencer);

export default router;
