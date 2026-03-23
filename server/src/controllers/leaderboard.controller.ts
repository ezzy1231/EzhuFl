import type { NextFunction, Request, Response } from "express";
import * as leaderboardService from "../services/leaderboard.service.js";
import { toAppError } from "../lib/errors.js";

/**
 * GET /api/campaigns/:id/leaderboard — Ranked participants for a campaign
 */
export async function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const leaderboard = await leaderboardService.getLeaderboard(id);
    res.status(200).json({ leaderboard });
  } catch (err: any) {
    next(toAppError(err));
  }
}
