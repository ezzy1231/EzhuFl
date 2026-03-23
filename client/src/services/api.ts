import axios from "axios";
import { supabase } from "../lib/supabase";

export interface ApiErrorDetail {
  path: string;
  message: string;
}

interface ApiErrorResponse {
  ok?: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status?: number;
  code: string;
  details?: unknown;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      details?: unknown;
      cause?: unknown;
    }
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "ApiError";
    this.status = options?.status;
    this.code = options?.code || "REQUEST_FAILED";
    this.details = options?.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Request failed"
): string {
  if (isApiError(error)) {
    if (Array.isArray(error.details) && error.details.length > 0) {
      const firstDetail = error.details[0] as Partial<ApiErrorDetail>;
      if (typeof firstDetail?.message === "string" && firstDetail.message) {
        return firstDetail.message;
      }
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function normalizeApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError(getApiErrorMessage(error), { cause: error });
  }

  const response = error.response?.data as ApiErrorResponse | undefined;
  const responseError = response?.error;
  const details = responseError?.details;

  let message = responseError?.message || error.message || "Request failed";
  if (Array.isArray(details) && details.length > 0) {
    const firstDetail = details[0] as Partial<ApiErrorDetail>;
    if (typeof firstDetail?.message === "string" && firstDetail.message) {
      message = firstDetail.message;
    }
  }

  return new ApiError(message, {
    status: error.response?.status,
    code: responseError?.code || error.code || "REQUEST_FAILED",
    details,
    cause: error,
  });
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// ── Request interceptor: attach Supabase access token ──
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// ── Response interceptor: handle 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Don't force reload — let the auth context handle session loss
      await supabase.auth.signOut();
    }
    return Promise.reject(normalizeApiError(error));
  }
);

export default api;
