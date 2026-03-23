import type { NextFunction, Request, Response } from "express";
import * as campaignService from "../services/campaign.service.js";
import { toAppError } from "../lib/errors.js";

/**
 * GET /api/internal/cron/complete-expired-campaigns
 * Runs the scheduled completion flow for expired active campaigns.
 */
export async function completeExpiredCampaignsJob(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const completed = await campaignService.completeExpiredCampaigns();
    res.status(200).json({
      ok: true,
      completed,
      ranAt: new Date().toISOString(),
    });
  } catch (err: any) {
    next(toAppError(err));
  }
}