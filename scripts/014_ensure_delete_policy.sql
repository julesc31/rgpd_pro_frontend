-- Ensure DELETE policy exists for scans table
-- This allows users to delete their own scans

-- Drop and recreate to be sure
DROP POLICY IF EXISTS "Users can delete own scans" ON public.scans;

CREATE POLICY "Users can delete own scans"
  ON public.scans FOR DELETE
  USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
