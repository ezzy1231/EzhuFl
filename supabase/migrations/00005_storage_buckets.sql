-- ============================================================
-- Migration: Storage buckets for file uploads
-- ============================================================
-- NOTE: Run these via Supabase Dashboard → Storage, or via SQL
-- if your Supabase project supports storage schema access.
--
-- Bucket structure:
--   licenses/  (private) — businessId/license.pdf
--   profiles/  (public)  — userId/photo.jpg
--   ids/       (private) — userId/id.jpg
-- ============================================================

-- Create buckets (if storage schema is available)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('licenses', 'licenses', false),
  ('profiles', 'profiles', true),
  ('ids', 'ids', false)
ON CONFLICT (id) DO NOTHING;

-- ── Storage policies for 'licenses' bucket ──────────────────

-- Business users can upload their own license files
CREATE POLICY "Business users upload licenses"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'licenses'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'BUSINESS'
    )
  );

-- Business users can view their own license files
CREATE POLICY "Business users view own licenses"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'licenses'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all license files
CREATE POLICY "Admins view all licenses"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'licenses'
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ── Storage policies for 'profiles' bucket ──────────────────

-- Users can upload their own profile photos
CREATE POLICY "Users upload own profile photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profiles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read access for profile photos
CREATE POLICY "Public read profile photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profiles');

-- ── Storage policies for 'ids' bucket ───────────────────────

-- Users can upload their own ID documents
CREATE POLICY "Users upload own ID documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ids'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own ID documents
CREATE POLICY "Users view own ID documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ids'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all ID documents
CREATE POLICY "Admins view all ID documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ids'
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
