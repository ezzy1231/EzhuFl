import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import type { CreateCampaignDto } from "../types/index.js";
import * as campaignService from "../services/campaign.service.js";
import { AppError, toAppError } from "../lib/errors.js";

/**
 * POST /api/campaigns — Create a new campaign (business only)
 */
export async function createCampaign(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const dto = req.body as CreateCampaignDto;

    const campaign = await campaignService.createCampaign(user.id, dto);
    res.status(201).json({ campaign });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * GET /api/campaigns — List all campaigns
 */
export async function getAllCampaigns(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const campaigns = await campaignService.getAllCampaigns();
    res.status(200).json({ campaigns });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * GET /api/campaigns/:id — Get campaign details
 */
export async function getCampaignById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const campaign = await campaignService.getCampaignById(id);

    if (!campaign) {
      next(new AppError(404, "Campaign not found", "NOT_FOUND"));
      return;
    }

    res.status(200).json({ campaign });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * GET /api/campaigns/my — Get campaigns owned by the current business
 */
export async function getMyCampaigns(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const campaigns = await campaignService.getCampaignsByBusiness(user.id);
    res.status(200).json({ campaigns });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * POST /api/campaigns/:id/join — Influencer joins a campaign
 */
export async function joinCampaign(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;

    await campaignService.joinCampaign(id, user.id);
    res.status(200).json({ message: "Successfully joined the campaign" });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * GET /api/campaigns/joined — Campaigns the current influencer has joined
 */
export async function getJoinedCampaigns(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const campaigns = await campaignService.getJoinedCampaigns(user.id);
    res.status(200).json({ campaigns });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * GET /api/campaigns/:id/joined — Check if current user has joined a campaign
 */
export async function checkJoined(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const joined = await campaignService.hasJoinedCampaign(id, user.id);
    res.status(200).json({ joined });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * POST /api/campaigns/:id/complete — Complete a campaign and award winners
 */
export async function completeCampaign(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const canManage = await campaignService.canManageCampaign(id, user.id, user.role);

    if (!canManage) {
      next(new AppError(403, "Only the campaign owner or an admin can complete this campaign", "FORBIDDEN"));
      return;
    }

    const result = await campaignService.completeCampaign(id);
    res.status(200).json(result);
  } catch (err: any) {
    next(toAppError(err));
  }
}
