import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";

/**
 * Guard internal cron endpoints with CRON_SECRET when configured.
 * In local development without a secret, allow the call for manual testing.
 */
export function cronSecretMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!env.CRON_SECRET) {
    if (process.env.VERCEL) {
      next(new AppError(500, "CRON_SECRET is not configured", "INTERNAL_SERVER_ERROR", undefined, false));
      return;
    }

    next();
    return;
  }

  const authHeader = req.headers.authorization;
  const expected = `Bearer ${env.CRON_SECRET}`;

  if (authHeader !== expected) {
    next(new AppError(401, "Unauthorized cron request", "UNAUTHORIZED"));
    return;
  }

  next();
}