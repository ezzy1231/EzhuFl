import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createProfile,
  getMe,
  updateBusinessProfile,
  updateInfluencerProfile,
} from "../controllers/auth.controller.js";

const router = Router();

// All auth routes require a valid Supabase token
router.use(authMiddleware);

router.post("/profile", createProfile);
router.get("/me", getMe);

// Extended profile endpoints
router.put("/business-profile", updateBusinessProfile);
router.put("/influencer-profile", updateInfluencerProfile);

export default router;
