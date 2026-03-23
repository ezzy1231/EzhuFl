import { z } from "zod";

const uuidSchema = z.string().uuid("Must be a valid UUID");

export const createSubmissionSchema = z.object({
  campaign_id: uuidSchema,
  video_url: z.string().trim().url("video_url must be a valid URL"),
  platform: z.enum(["TIKTOK", "INSTAGRAM", "YOUTUBE", "TWITTER"]),
  views: z.coerce.number().int("views must be a whole number").nonnegative("views must be zero or greater").optional(),
  likes: z.coerce.number().int("likes must be a whole number").nonnegative("likes must be zero or greater").optional(),
  comments: z.coerce.number().int("comments must be a whole number").nonnegative("comments must be zero or greater").optional(),
}).strict();

export const submissionIdParamsSchema = z.object({
  id: uuidSchema,
});

export const campaignSubmissionParamsSchema = z.object({
  campaignId: uuidSchema,
});