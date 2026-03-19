import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import type { CreateCampaignDto } from "../types/index.js";
import * as campaignService from "../services/campaign.service.js";

/**
 * POST /api/campaigns — Create a new campaign (business only)
 */
export async function createCampaign(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const dto = req.body as CreateCampaignDto;

    if (!dto.title || !dto.budget || !dto.duration_days) {
      res
        .status(400)
        .json({ error: "title, budget, and duration_days are required" });
      return;
    }

    if (dto.duration_days < 1 || dto.duration_days > 3) {
      res.status(400).json({ error: "duration_days must be between 1 and 3" });
      return;
    }

    if (dto.budget <= 0) {
      res.status(400).json({ error: "budget must be a positive number" });
      return;
    }

    const campaign = await campaignService.createCampaign(user.id, dto);
    res.status(201).json({ campaign });
  } catch (err: any) {
    console.error("Create campaign error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

/**
 * GET /api/campaigns — List all campaigns
 */
export async function getAllCampaigns(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    // Auto-complete any expired campaigns before listing
    await campaignService.completeExpiredCampaigns();
    const campaigns = await campaignService.getAllCampaigns();
    res.status(200).json({ campaigns });
  } catch (err: any) {
    console.error("Get campaigns error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

/**
 * GET /api/campaigns/:id — Get campaign details
 */
export async function getCampaignById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    const campaign = await campaignService.getCampaignById(id);

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.status(200).json({ campaign });
  } catch (err: any) {
    console.error("Get campaign error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

/**
 * GET /api/campaigns/my — Get campaigns owned by the current business
 */
export async function getMyCampaigns(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const campaigns = await campaignService.getCampaignsByBusiness(user.id);
    res.status(200).json({ campaigns });
  } catch (err: any) {
    console.error("Get my campaigns error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

/**
 * POST /api/campaigns/:id/join — Influencer joins a campaign
 */
export async function joinCampaign(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;

    await campaignService.joinCampaign(id, user.id);
    res.status(200).json({ message: "Successfully joined the campaign" });
  } catch (err: any) {
    console.error("Join campaign error:", err);
    const status = err.message?.includes("not found")
      ? 404
      : err.message?.includes("Already joined")
        ? 409
        : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}

/**
 * GET /api/campaigns/joined — Campaigns the current influencer has joined
 */
export async function getJoinedCampaigns(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const campaigns = await campaignService.getJoinedCampaigns(user.id);
    res.status(200).json({ campaigns });
  } catch (err: any) {
    console.error("Get joined campaigns error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

/**
 * GET /api/campaigns/:id/joined — Check if current user has joined a campaign
 */
export async function checkJoined(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const joined = await campaignService.hasJoinedCampaign(id, user.id);
    res.status(200).json({ joined });
  } catch (err: any) {
    console.error("Check joined error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

/**
 * POST /api/campaigns/:id/complete — Complete a campaign and award winners
 */
export async function completeCampaign(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await campaignService.completeCampaign(id);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Complete campaign error:", err);
    const status = err.message?.includes("not found")
      ? 404
      : err.message?.includes("already completed")
        ? 409
        : 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  }
}
