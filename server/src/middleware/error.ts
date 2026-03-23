import type { NextFunction, Request, Response } from "express";
import { AppError, createErrorResponse, toAppError } from "../lib/errors.js";

export function notFoundMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new AppError(404, "Route not found", "NOT_FOUND"));
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const appError = toAppError(error);

  if (appError.statusCode >= 500) {
    console.error(appError.message, error);
  }

  res.status(appError.statusCode).json(createErrorResponse(appError));
}