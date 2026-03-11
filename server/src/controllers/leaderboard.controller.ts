import type { Request, Response } from "express";
import * as leaderboardService from "../services/leaderboard.service.js";

/**
 * GET /api/campaigns/:id/leaderboard — Ranked participants for a campaign
 */
export async function getLeaderboard(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    const leaderboard = await leaderboardService.getLeaderboard(id);
    res.status(200).json({ leaderboard });
  } catch (err: any) {
    console.error("Get leaderboard error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
