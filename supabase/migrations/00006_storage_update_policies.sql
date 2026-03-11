-- ============================================================
-- Migration: Add UPDATE / DELETE policies on storage objects
-- The original migration only had INSERT + SELECT.
-- The frontend uses `upsert: true` which requires UPDATE,
-- and DELETE is needed for file replacement flows.
-- ============================================================

-- ── licenses bucket ─────────────────────────────────────────

CREATE POLICY "Business users update own licenses"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'licenses'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'BUSINESS'
    )
  )
  WITH CHECK (
    bucket_id = 'licenses'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'BUSINESS'
    )
  );

CREATE POLICY "Business users delete own licenses"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'licenses'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'BUSINESS'
    )
  );

-- ── profiles bucket ─────────────────────────────────────────

CREATE POLICY "Users update own profile photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profiles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profiles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own profile photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profiles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── ids bucket ──────────────────────────────────────────────

CREATE POLICY "Users update own ID documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'ids'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'ids'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own ID documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ids'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
