-- ============================================================
-- Migration: Create core tables
-- ============================================================

-- ── Users ───────────────────────────────────────────────────
CREATE TABLE public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  role       TEXT NOT NULL DEFAULT 'INFLUENCER'
               CHECK (role IN ('BUSINESS', 'INFLUENCER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';

-- ── Campaigns ───────────────────────────────────────────────
CREATE TABLE public.campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  budget        NUMERIC(10,2) NOT NULL CHECK (budget > 0),
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 3),
  winners_count INTEGER NOT NULL DEFAULT 3 CHECK (winners_count >= 1),
  status        TEXT NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  start_date    TIMESTAMPTZ,
  end_date      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.campaigns IS 'Performance-based influencer campaigns';

-- ── Participants ────────────────────────────────────────────
CREATE TABLE public.participants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

COMMENT ON TABLE public.participants IS 'Influencers who joined a campaign';

-- ── Submissions ─────────────────────────────────────────────
CREATE TABLE public.submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_url    TEXT NOT NULL,
  platform     TEXT NOT NULL CHECK (platform IN ('TIKTOK', 'INSTAGRAM')),
  views        INTEGER NOT NULL DEFAULT 0,
  likes        INTEGER NOT NULL DEFAULT 0,
  comments     INTEGER NOT NULL DEFAULT 0,
  score        NUMERIC NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.submissions IS 'Video submissions with performance metrics';

-- ── Payments ────────────────────────────────────────────────
CREATE TABLE public.payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  status      TEXT NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING', 'PAID', 'FAILED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payments IS 'Prize payments to winning influencers';
