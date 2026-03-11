-- ============================================================
-- Migration: Enable RLS and create policies
-- ============================================================

-- ── Users ───────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── Campaigns ───────────────────────────────────────────────
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Business owners can create campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'BUSINESS'
    )
  );

CREATE POLICY "Business owners can update own campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "Business owners can delete own campaigns"
  ON public.campaigns FOR DELETE
  TO authenticated
  USING (business_id = auth.uid());

-- ── Participants ────────────────────────────────────────────
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view participants"
  ON public.participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Influencers can join campaigns"
  ON public.participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'INFLUENCER'
    )
  );

-- ── Submissions ─────────────────────────────────────────────
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Influencers can create submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.participants
      WHERE campaign_id = submissions.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Payments ────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
