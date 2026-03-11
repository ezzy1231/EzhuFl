-- ============================================================
-- Migration: Campaign cover images, platforms, rate_per_1k
--            + Business profile photo
-- ============================================================

-- ── Campaign enhancements ───────────────────────────────────
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS platforms       TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rate_per_1k     NUMERIC(10,2);

COMMENT ON COLUMN public.campaigns.cover_image_url IS 'Cover/thumbnail image for the campaign';
COMMENT ON COLUMN public.campaigns.platforms       IS 'Array of target platforms, e.g. {TIKTOK,INSTAGRAM,YOUTUBE}';
COMMENT ON COLUMN public.campaigns.rate_per_1k     IS 'Pay rate per 1 000 views';

-- ── Business profile photo ──────────────────────────────────
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

COMMENT ON COLUMN public.business_profiles.profile_photo_url IS 'Business logo / profile photo URL';
