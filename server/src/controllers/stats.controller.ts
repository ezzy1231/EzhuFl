import type { Request, Response } from "express";
import * as statsService from "../services/stats.service.js";

/**
 * GET /api/stats — Public platform stats for the landing page
 */
export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await statsService.getPublicStats();
    res.status(200).json(stats);
  } catch (err: any) {
    console.error("Get stats error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
