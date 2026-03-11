-- ============================================================
-- Migration: Verification System — business profiles, admin
-- ============================================================

-- ── Add ADMIN role to users ─────────────────────────────────
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('BUSINESS', 'INFLUENCER', 'ADMIN'));

-- ── Business Profiles ───────────────────────────────────────
CREATE TABLE public.business_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  business_name       TEXT NOT NULL DEFAULT '',
  owner_name          TEXT NOT NULL DEFAULT '',
  phone               TEXT NOT NULL DEFAULT '',
  city                TEXT NOT NULL DEFAULT '',
  address             TEXT NOT NULL DEFAULT '',
  license_number      TEXT NOT NULL DEFAULT '',
  license_file_url    TEXT,
  map_lat             NUMERIC(10,7),
  map_lng             NUMERIC(10,7),
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  reviewed_by         UUID REFERENCES public.users(id),
  reviewed_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.business_profiles
  IS 'Extended business profiles with verification status';

-- ── Influencer Profiles ─────────────────────────────────────
CREATE TABLE public.influencer_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  display_name        TEXT NOT NULL DEFAULT '',
  bio                 TEXT NOT NULL DEFAULT '',
  phone               TEXT NOT NULL DEFAULT '',
  city                TEXT NOT NULL DEFAULT '',
  profile_photo_url   TEXT,
  id_document_url     TEXT,
  tiktok_handle       TEXT,
  instagram_handle    TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'basic', 'verified')),
  reviewed_by         UUID REFERENCES public.users(id),
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.influencer_profiles
  IS 'Extended influencer profiles with verification tiers';

-- ── RLS for business_profiles ───────────────────────────────
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business profile"
  ON public.business_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own business profile"
  ON public.business_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all business profiles
CREATE POLICY "Admins can view all business profiles"
  ON public.business_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can update any business profile (approve/reject)
CREATE POLICY "Admins can update any business profile"
  ON public.business_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ── RLS for influencer_profiles ─────────────────────────────
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own influencer profile"
  ON public.influencer_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own influencer profile"
  ON public.influencer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own influencer profile"
  ON public.influencer_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all influencer profiles
CREATE POLICY "Admins can view all influencer profiles"
  ON public.influencer_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can update any influencer profile
CREATE POLICY "Admins can update any influencer profile"
  ON public.influencer_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX idx_business_profiles_status ON public.business_profiles(verification_status);
CREATE INDEX idx_influencer_profiles_user_id ON public.influencer_profiles(user_id);
CREATE INDEX idx_influencer_profiles_status ON public.influencer_profiles(verification_status);

-- ── Storage buckets ─────────────────────────────────────────
-- Run these via Supabase dashboard or management API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('licenses', 'licenses', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ids', 'ids', false);

-- ── Update campaign INSERT policy to require approved business ──
DROP POLICY IF EXISTS "Business owners can create campaigns" ON public.campaigns;

CREATE POLICY "Approved business owners can create campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'BUSINESS'
    )
    AND EXISTS (
      SELECT 1 FROM public.business_profiles
        WHERE user_id = auth.uid() AND verification_status = 'approved'
    )
  );
