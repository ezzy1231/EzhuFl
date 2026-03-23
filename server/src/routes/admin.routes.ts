import { Router } from "express";
import { authMiddleware, adminOnly } from "../middleware/auth.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation.js";
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
import {
  adminBusinessListQuerySchema,
  adminBusinessReviewSchema,
  adminInfluencerListQuerySchema,
  adminInfluencerReviewSchema,
  adminProfileIdParamsSchema,
  adminSuspendBusinessSchema,
} from "../validation/admin.validation.js";

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminOnly);

// Dashboard
router.get("/stats", getAdminStats);

// Business verification
router.get("/businesses", validateQuery(adminBusinessListQuerySchema), getBusinesses);
router.get("/businesses/pending", getPendingBusinesses);
router.get("/businesses/:id", validateParams(adminProfileIdParamsSchema), getBusinessDetail);
router.post(
  "/businesses/:id/review",
  validateParams(adminProfileIdParamsSchema),
  validateBody(adminBusinessReviewSchema),
  reviewBusiness
);
router.post(
  "/businesses/:id/suspend",
  validateParams(adminProfileIdParamsSchema),
  validateBody(adminSuspendBusinessSchema),
  suspendBusiness
);

// Influencer verification
router.get("/influencers", validateQuery(adminInfluencerListQuerySchema), getInfluencers);
router.get("/influencers/:id", validateParams(adminProfileIdParamsSchema), getInfluencerDetail);
router.post(
  "/influencers/:id/review",
  validateParams(adminProfileIdParamsSchema),
  validateBody(adminInfluencerReviewSchema),
  reviewInfluencer
);

export default router;
