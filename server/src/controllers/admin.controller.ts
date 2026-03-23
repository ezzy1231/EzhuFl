import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import type { AdminReviewDto } from "../types/index.js";
import * as adminService from "../services/admin.service.js";
import { AppError, toAppError } from "../lib/errors.js";

// ── Dashboard ───────────────────────────────────────────────

/**
 * GET /api/admin/stats — Admin dashboard statistics
 */
export async function getAdminStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminService.getAdminStats();
    res.status(200).json({ stats });
  } catch (err: any) {
    next(toAppError(err));
  }
}

// ── Business verification ───────────────────────────────────

/**
 * GET /api/admin/businesses — List business profiles (optionally filter by status)
 */
export async function getBusinesses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const businesses = await adminService.getAllBusinessProfiles(
      status as any
    );
    res.status(200).json({ businesses });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * GET /api/admin/businesses/pending — List only pending businesses
 */
export async function getPendingBusinesses(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businesses = await adminService.getPendingBusinesses();
    res.status(200).json({ businesses });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * GET /api/admin/businesses/:id — Get business profile details
 */
export async function getBusinessDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const business = await adminService.getBusinessProfileById(id);
    if (!business) {
      next(new AppError(404, "Business profile not found", "NOT_FOUND"));
      return;
    }
    res.status(200).json({ business });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * POST /api/admin/businesses/:id/review — Approve or reject a business
 */
export async function reviewBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const { action, rejection_reason } = req.body as AdminReviewDto;

    const business = await adminService.reviewBusiness(
      id,
      user.id,
      action,
      rejection_reason
    );
    res.status(200).json({ business });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * POST /api/admin/businesses/:id/suspend — Suspend a business
 */
export async function suspendBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const reason = (req.body.reason as string) || "Policy violation";

    const business = await adminService.suspendBusiness(
      id,
      user.id,
      reason
    );
    res.status(200).json({ business });
  } catch (err: any) {
    next(toAppError(err));
  }
}

// ── Influencer verification ─────────────────────────────────

/**
 * GET /api/admin/influencers — List influencer profiles (optionally filter by status)
 */
export async function getInfluencers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const influencers = await adminService.getAllInfluencerProfiles(
      status as any
    );
    res.status(200).json({ influencers });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * GET /api/admin/influencers/:id — Get influencer profile details
 */
export async function getInfluencerDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const influencer = await adminService.getInfluencerProfileById(id);
    if (!influencer) {
      next(new AppError(404, "Influencer profile not found", "NOT_FOUND"));
      return;
    }
    res.status(200).json({ influencer });
  } catch (err: any) {
    next(toAppError(err));
  }
}

/**
 * POST /api/admin/influencers/:id/review — Verify or unverify an influencer
 */
export async function reviewInfluencer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const action = req.body.action as "verify" | "unverify";

    const influencer = await adminService.reviewInfluencer(
      id,
      user.id,
      action
    );
    res.status(200).json({ influencer });
  } catch (err: any) {
    next(toAppError(err));
  }
}
