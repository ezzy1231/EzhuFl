-- ============================================================
-- Migration: Storage buckets for campaign covers and
--            business profile photos
-- ============================================================

-- ── Campaign covers bucket (public) ─────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-covers', 'campaign-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Business users can upload campaign covers
CREATE POLICY "Business users upload campaign covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'campaign-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'BUSINESS'
    )
  );

-- Public read access for campaign covers
CREATE POLICY "Public read campaign covers"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'campaign-covers');

-- Business users can update their own campaign covers
CREATE POLICY "Business users update campaign covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'campaign-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── Profile photos bucket (public) ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Users can upload their own profile photos
CREATE POLICY "Users upload profile photos to profile-photos bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read access for profile photos
CREATE POLICY "Public read profile photos from profile-photos bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');

-- Users can update their own profile photos
CREATE POLICY "Users update own profile photos in profile-photos bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
