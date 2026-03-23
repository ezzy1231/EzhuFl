import { z } from "zod";

const uuidSchema = z.string().uuid("Must be a valid UUID");

const platformSchema = z.enum(["TIKTOK", "INSTAGRAM", "YOUTUBE", "TWITTER"]);

export const campaignIdParamsSchema = z.object({
  id: uuidSchema,
});

export const createCampaignSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(120, "title must be 120 characters or fewer"),
  description: z.string().trim().max(5000, "description must be 5000 characters or fewer").optional(),
  budget: z.coerce.number().positive("budget must be a positive number"),
  duration_days: z.coerce.number().int("duration_days must be a whole number").min(1, "duration_days must be between 1 and 3").max(3, "duration_days must be between 1 and 3"),
  winners_count: z.coerce.number().int("winners_count must be a whole number").min(1, "winners_count must be at least 1").max(10, "winners_count must be 10 or fewer").optional(),
  cover_image_url: z.string().trim().min(1, "cover_image_url cannot be empty").optional(),
  platforms: z.array(platformSchema).max(4, "platforms can include at most 4 entries").optional(),
  rate_per_1k: z.coerce.number().nonnegative("rate_per_1k must be zero or greater").optional(),
}).strict();