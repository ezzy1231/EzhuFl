-- ============================================================
-- Migration: Align schema with app usage and tighten RLS
-- ============================================================

-- ── Campaign columns used by the app ─────────────────────────
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS platforms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS rate_per_1k NUMERIC(10,2);

-- ── Business profile photo used in campaign enrichment ──────
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- ── Submission platform values used by the API ──────────────
ALTER TABLE public.submissions
  DROP CONSTRAINT IF EXISTS submissions_platform_check;

ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_platform_check
  CHECK (platform IN ('TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER'));

-- ── RLS: restrict participant visibility ────────────────────
DROP POLICY IF EXISTS "Anyone authenticated can view participants" ON public.participants;

CREATE POLICY "Users can view relevant participants"
  ON public.participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.campaigns
      WHERE campaigns.id = participants.campaign_id
      AND campaigns.business_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- ── RLS: restrict submission visibility ─────────────────────
DROP POLICY IF EXISTS "Anyone authenticated can view submissions" ON public.submissions;

CREATE POLICY "Users can view relevant submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.campaigns
      WHERE campaigns.id = submissions.campaign_id
      AND campaigns.business_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );