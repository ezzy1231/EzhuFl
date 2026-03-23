import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  createProfile,
  getMe,
  updateBusinessProfile,
  updateInfluencerProfile,
} from "../controllers/auth.controller.js";
import {
  createProfileSchema,
  updateBusinessProfileSchema,
  updateInfluencerProfileSchema,
} from "../validation/auth.validation.js";

const router = Router();

// All auth routes require a valid Supabase token
router.use(authMiddleware);

router.post("/profile", validateBody(createProfileSchema), createProfile);
router.get("/me", getMe);

// Extended profile endpoints
router.put(
  "/business-profile",
  validateBody(updateBusinessProfileSchema),
  updateBusinessProfile
);
router.put(
  "/influencer-profile",
  validateBody(updateInfluencerProfileSchema),
  updateInfluencerProfile
);

export default router;
