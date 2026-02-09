-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update own scans" ON public.scans;
DROP POLICY IF EXISTS "Admins can view all scans" ON public.scans;

DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;

DROP POLICY IF EXISTS "Users can view own timeline" ON public.activity_timeline;
DROP POLICY IF EXISTS "Users can insert own timeline" ON public.activity_timeline;
DROP POLICY IF EXISTS "Admins can view all timeline" ON public.activity_timeline;

-- Drop the helper function if it exists
DROP FUNCTION IF EXISTS public.is_admin();

-- Create simple, non-recursive RLS policies using only auth.uid()

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Scans policies
CREATE POLICY "Users can view own scans"
  ON public.scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON public.scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON public.scans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON public.scans FOR DELETE
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- Activity timeline policies
CREATE POLICY "Users can view own timeline"
  ON public.activity_timeline FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline"
  ON public.activity_timeline FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Admin access will be handled at the application level
-- by checking the user's role in the profiles table AFTER fetching their profile
-- This prevents infinite recursion in RLS policies
