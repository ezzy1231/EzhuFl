import { z } from "zod";

const uuidSchema = z.string().uuid("Must be a valid UUID");

export const adminProfileIdParamsSchema = z.object({
  id: uuidSchema,
});

export const adminBusinessListQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
});

export const adminInfluencerListQuerySchema = z.object({
  status: z.enum(["unverified", "basic", "verified"]).optional(),
});

export const adminBusinessReviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejection_reason: z.string().trim().max(1000, "rejection_reason must be 1000 characters or fewer").optional(),
}).strict();

export const adminSuspendBusinessSchema = z.object({
  reason: z.string().trim().min(1, "reason is required").max(1000, "reason must be 1000 characters or fewer").optional().default("Policy violation"),
}).strict();

export const adminInfluencerReviewSchema = z.object({
  action: z.enum(["verify", "unverify"]),
}).strict();