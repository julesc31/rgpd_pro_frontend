-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all scans" ON public.scans;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_timeline;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Recreate admin policies using the helper function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can view all scans"
  ON public.scans FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all scans"
  ON public.scans FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all activity"
  ON public.activity_timeline FOR SELECT
  USING (public.is_admin());
