import { Router } from "express";
import {
  tiktokAuth,
  tiktokCallback,
} from "../controllers/tiktok.controller.js";

const router = Router();

// These routes are public (no auth middleware) — they handle the OAuth flow itself
router.get("/tiktok", tiktokAuth);
router.get("/tiktok/callback", tiktokCallback);

export default router;
