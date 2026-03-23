import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";

function formatZodError(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function validateBody<TSchema extends ZodTypeAny>(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(
          400,
          "Invalid request body",
          "VALIDATION_ERROR",
          formatZodError(result.error)
        )
      );
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateParams<TSchema extends ZodTypeAny>(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(
        new AppError(
          400,
          "Invalid route parameters",
          "VALIDATION_ERROR",
          formatZodError(result.error)
        )
      );
      return;
    }

    req.params = result.data as Request["params"];
    next();
  };
}

export function validateQuery<TSchema extends ZodTypeAny>(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(
        new AppError(
          400,
          "Invalid query parameters",
          "VALIDATION_ERROR",
          formatZodError(result.error)
        )
      );
      return;
    }

    req.query = result.data as Request["query"];
    next();
  };
}