import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import type { CreateSubmissionDto } from "../types/index.js";
import * as submissionService from "../services/submission.service.js";
import { toAppError } from "../lib/errors.js";

/**
 * POST /api/submissions — Submit a video link for a campaign
 */
export async function createSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const dto = req.body as CreateSubmissionDto;

    const submission = await submissionService.createSubmission(user.id, dto);
    res.status(201).json({ submission });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * POST /api/submissions/:id/refresh — Re-fetch metrics for a single submission
 */
export async function refreshSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const submission = await submissionService.refreshSubmissionMetrics(id, user.id, user.role);
    res.status(200).json({ submission });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * POST /api/submissions/campaign/:campaignId/refresh — Re-fetch metrics for all submissions in a campaign
 */
export async function refreshCampaignSubmissions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const campaignId = req.params.campaignId as string;
    const submissions = await submissionService.refreshCampaignMetrics(campaignId, user.id, user.role);
    res.status(200).json({ submissions });
  } catch (err: any) {
    next(toAppError(err));
  }
}
