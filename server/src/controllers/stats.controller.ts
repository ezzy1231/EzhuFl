import type { NextFunction, Request, Response } from "express";
import * as statsService from "../services/stats.service.js";
import { toAppError } from "../lib/errors.js";

/**
 * GET /api/stats — Public platform stats for the landing page
 */
export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await statsService.getPublicStats();
    res.status(200).json(stats);
  } catch (err: any) {
    next(toAppError(err));
  }
}
