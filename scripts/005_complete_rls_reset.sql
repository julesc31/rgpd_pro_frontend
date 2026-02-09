-- Complete RLS Policy Reset - Fixes Infinite Recursion
-- This script drops ALL existing policies and creates simple, non-recursive ones

-- ============================================
-- STEP 1: Drop ALL existing policies
-- ============================================

-- Drop policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- Drop policies on scans table
DROP POLICY IF EXISTS "Users can view own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can create own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update own scans" ON public.scans;
DROP POLICY IF EXISTS "Admins can view all scans" ON public.scans;
DROP POLICY IF EXISTS "Enable read access for own scans" ON public.scans;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.scans;
DROP POLICY IF EXISTS "Enable update for own scans" ON public.scans;

-- Drop policies on reports table
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create own reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Enable read access for own reports" ON public.reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reports;

-- Drop policies on activity_timeline table
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_timeline;
DROP POLICY IF EXISTS "Users can create own activity" ON public.activity_timeline;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_timeline;
DROP POLICY IF EXISTS "Enable read access for own activity" ON public.activity_timeline;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.activity_timeline;

-- Drop helper function if exists
DROP FUNCTION IF EXISTS public.is_admin();

-- ============================================
-- STEP 2: Create simple, non-recursive policies
-- ============================================

-- Profiles table policies (only use auth.uid())
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Scans table policies (only use auth.uid())
CREATE POLICY "Users can view own scans"
  ON public.scans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scans"
  ON public.scans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON public.scans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Reports table policies (only use auth.uid())
CREATE POLICY "Users can view own reports"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Activity timeline policies (only use auth.uid())
CREATE POLICY "Users can view own activity"
  ON public.activity_timeline
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity"
  ON public.activity_timeline
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'scans', 'reports', 'activity_timeline');

-- List all policies to confirm
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
