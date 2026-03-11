-- ============================================================
-- Migration: Create indexes for performance
-- ============================================================

-- Campaigns by status (filtering active campaigns)
CREATE INDEX idx_campaigns_status ON public.campaigns (status);

-- Campaigns by business owner
CREATE INDEX idx_campaigns_business_id ON public.campaigns (business_id);

-- Participants by campaign (listing participants)
CREATE INDEX idx_participants_campaign_id ON public.participants (campaign_id);

-- Participants by user (finding user's campaigns)
CREATE INDEX idx_participants_user_id ON public.participants (user_id);

-- Submissions by campaign + score desc (leaderboard queries)
CREATE INDEX idx_submissions_campaign_score
  ON public.submissions (campaign_id, score DESC);

-- Submissions by user
CREATE INDEX idx_submissions_user_id ON public.submissions (user_id);

-- Payments by user
CREATE INDEX idx_payments_user_id ON public.payments (user_id);

-- Payments by campaign
CREATE INDEX idx_payments_campaign_id ON public.payments (campaign_id);
