-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS scans_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scans_limit INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Update existing users to have free plan with 2 scans
UPDATE public.profiles 
SET subscription_plan = 'free', 
    scans_limit = 2,
    scans_used = COALESCE((
      SELECT COUNT(*) FROM public.scans 
      WHERE scans.user_id = profiles.id 
      AND scans.status = 'completed'
    ), 0)
WHERE subscription_plan IS NULL;

-- Create function to increment scan count
CREATE OR REPLACE FUNCTION public.increment_scan_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment when scan completes successfully
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles 
    SET scans_used = scans_used + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-increment scan count
DROP TRIGGER IF EXISTS on_scan_completed ON public.scans;
CREATE TRIGGER on_scan_completed
  AFTER UPDATE ON public.scans
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_scan_count();

-- Comment for reference:
-- free: 2 scans total, normal only
-- starter: 5 scans/month, normal only  
-- pro: 30 scans/month, normal + forensic
-- enterprise: unlimited, all features
