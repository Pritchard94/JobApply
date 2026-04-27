-- =============================================
-- JobAutoApply - Supabase Database Migration
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ──────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  years_of_experience SMALLINT,
  active_cv_id UUID,
  auto_apply_enabled BOOLEAN NOT NULL DEFAULT false,
  daily_apply_limit SMALLINT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────
-- 2. CVS (uploaded resumes)
-- ──────────────────────────────────────────────
CREATE TABLE public.cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  parsed_data JSONB,
  parse_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (parse_status IN ('pending', 'processing', 'completed', 'failed')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cvs_user_id ON public.cvs(user_id);

-- Add FK for active_cv_id after cvs table exists
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_active_cv
  FOREIGN KEY (active_cv_id) REFERENCES public.cvs(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────────
-- 3. SEARCH PROFILES
-- ──────────────────────────────────────────────
CREATE TABLE public.search_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_titles TEXT[] NOT NULL DEFAULT '{}',
  locations TEXT[] NOT NULL DEFAULT '{}',
  remote_only BOOLEAN NOT NULL DEFAULT false,
  job_types TEXT[] NOT NULL DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT NOT NULL DEFAULT 'USD',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  excluded_companies TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  search_frequency TEXT NOT NULL DEFAULT 'daily'
    CHECK (search_frequency IN ('daily', 'twice_daily', 'weekly')),
  last_searched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_profiles_user_active ON public.search_profiles(user_id, is_active);

-- ──────────────────────────────────────────────
-- 4. FOUND JOBS (shared deduplicated pool)
-- ──────────────────────────────────────────────
CREATE TABLE public.found_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  source TEXT NOT NULL,
  dedup_hash TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN,
  job_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT,
  description TEXT,
  requirements TEXT,
  apply_url TEXT,
  apply_email TEXT,
  apply_method TEXT NOT NULL DEFAULT 'unknown'
    CHECK (apply_method IN ('email', 'url', 'form', 'manual', 'unknown')),
  company_logo_url TEXT,
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_found_jobs_source ON public.found_jobs(source, created_at);

-- ──────────────────────────────────────────────
-- 5. JOB MATCHES (search profile <-> job with score)
-- ──────────────────────────────────────────────
CREATE TABLE public.job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_profile_id UUID NOT NULL REFERENCES public.search_profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.found_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_score REAL NOT NULL DEFAULT 0,
  match_reasoning TEXT,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(search_profile_id, job_id)
);

CREATE INDEX idx_job_matches_user ON public.job_matches(user_id, is_dismissed);
CREATE INDEX idx_job_matches_score ON public.job_matches(user_id, match_score DESC);

-- ──────────────────────────────────────────────
-- 6. APPLICATIONS
-- ──────────────────────────────────────────────
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.found_jobs(id) ON DELETE CASCADE,
  search_profile_id UUID REFERENCES public.search_profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'interview', 'rejected', 'offer')),
  apply_method TEXT NOT NULL DEFAULT 'email'
    CHECK (apply_method IN ('email', 'url', 'form', 'manual', 'unknown')),
  tailored_cv_url TEXT,
  cover_letter TEXT,
  email_thread_id TEXT,
  email_message_id TEXT,
  applied_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX idx_applications_user_status ON public.applications(user_id, status);

-- ──────────────────────────────────────────────
-- 7. APPLICATION EVENTS (status change log)
-- ──────────────────────────────────────────────
CREATE TABLE public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('created', 'sent', 'opened', 'replied', 'status_changed')),
  old_status TEXT,
  new_status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_events_app ON public.application_events(application_id);

-- ──────────────────────────────────────────────
-- 8. GMAIL TOKENS (encrypted OAuth2 tokens)
-- ──────────────────────────────────────────────
CREATE TABLE public.gmail_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  gmail_address TEXT NOT NULL DEFAULT '',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- 9. PUSH SUBSCRIPTIONS
-- ──────────────────────────────────────────────
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_subs_user ON public.push_subscriptions(user_id);

-- ──────────────────────────────────────────────
-- 10. NOTIFICATION PREFERENCES
-- ──────────────────────────────────────────────
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notify_application_sent BOOLEAN NOT NULL DEFAULT true,
  notify_response_received BOOLEAN NOT NULL DEFAULT true,
  notify_new_matches BOOLEAN NOT NULL DEFAULT true,
  notify_daily_summary BOOLEAN NOT NULL DEFAULT false,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- CVs: users can only access their own
CREATE POLICY "Users can view own CVs" ON public.cvs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own CVs" ON public.cvs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own CVs" ON public.cvs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own CVs" ON public.cvs
  FOR DELETE USING (auth.uid() = user_id);

-- Search Profiles
CREATE POLICY "Users can view own search profiles" ON public.search_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search profiles" ON public.search_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own search profiles" ON public.search_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own search profiles" ON public.search_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Found Jobs: all authenticated users can read (shared pool)
CREATE POLICY "Authenticated users can view jobs" ON public.found_jobs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Job Matches
CREATE POLICY "Users can view own matches" ON public.job_matches
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own matches" ON public.job_matches
  FOR UPDATE USING (auth.uid() = user_id);

-- Applications
CREATE POLICY "Users can view own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Application Events
CREATE POLICY "Users can view own app events" ON public.application_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- Gmail Tokens
CREATE POLICY "Users can view own gmail tokens" ON public.gmail_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own gmail tokens" ON public.gmail_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Push Subscriptions
CREATE POLICY "Users can view own push subs" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own push subs" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Notification Preferences
CREATE POLICY "Users can view own notif prefs" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notif prefs" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- STORAGE BUCKET
-- ──────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can manage their own files
CREATE POLICY "Users can upload own CVs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own CVs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own CVs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
