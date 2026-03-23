export interface ErrorResponseBody {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;
  expose: boolean;

  constructor(
    statusCode: number,
    message: string,
    code = "INTERNAL_SERVER_ERROR",
    details?: unknown,
    expose = true
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.expose = expose;
  }
}

export function createErrorResponse(error: AppError): ErrorResponseBody {
  return {
    ok: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  };
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes("not found")) {
      return new AppError(404, error.message, "NOT_FOUND");
    }

    if (
      error.message.includes("Already joined") ||
      error.message.includes("already completed")
    ) {
      return new AppError(409, error.message, "CONFLICT");
    }

    if (
      error.message.includes("Not authorized") ||
      error.message.includes("must join") ||
      error.message.includes("account required") ||
      error.message.includes("not verified") ||
      error.message.includes("verification required") ||
      error.message.includes("profile incomplete")
    ) {
      return new AppError(403, error.message, "FORBIDDEN");
    }

    if (error.message.includes("Missing or invalid authorization header")) {
      return new AppError(401, error.message, "UNAUTHORIZED");
    }

    if (error.message.includes("Invalid or expired token")) {
      return new AppError(401, error.message, "UNAUTHORIZED");
    }
  }

  return new AppError(
    500,
    "Internal server error",
    "INTERNAL_SERVER_ERROR",
    undefined,
    false
  );
}