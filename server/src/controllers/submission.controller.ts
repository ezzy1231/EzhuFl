import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import type { CreateSubmissionDto } from "../types/index.js";
import * as submissionService from "../services/submission.service.js";

/**
 * POST /api/submissions — Submit a video link for a campaign
 */
export async function createSubmission(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const dto = req.body as CreateSubmissionDto;

    if (!dto.campaign_id || !dto.video_url || !dto.platform) {
      res
        .status(400)
        .json({ error: "campaign_id, video_url, and platform are required" });
      return;
    }

    if (![
      "TIKTOK", "INSTAGRAM", "YOUTUBE", "TWITTER",
    ].includes(dto.platform)) {
      res
        .status(400)
        .json({ error: "platform must be TIKTOK, INSTAGRAM, YOUTUBE, or TWITTER" });
      return;
    }

    const submission = await submissionService.createSubmission(user.id, dto);
    res.status(201).json({ submission });
  } catch (err: any) {
    console.error("Create submission error:", err);
    const status = err.message?.includes("must join") ? 403 : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}

/**
 * POST /api/submissions/:id/refresh — Re-fetch metrics for a single submission
 */
export async function refreshSubmission(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    const submission = await submissionService.refreshSubmissionMetrics(id);
    res.status(200).json({ submission });
  } catch (err: any) {
    console.error("Refresh submission error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

/**
 * POST /api/submissions/campaign/:campaignId/refresh — Re-fetch metrics for all submissions in a campaign
 */
export async function refreshCampaignSubmissions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const campaignId = req.params.campaignId as string;
    const submissions = await submissionService.refreshCampaignMetrics(campaignId);
    res.status(200).json({ submissions });
  } catch (err: any) {
    console.error("Refresh campaign submissions error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
