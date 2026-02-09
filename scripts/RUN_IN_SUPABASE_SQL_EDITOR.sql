-- =============================================================================
-- À LANCER DANS SUPABASE : SQL Editor (Dashboard > SQL Editor > New query)
-- Exécuter tout le fichier en une fois, ou bloc par bloc dans l'ordre.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Schéma de base (si projet neuf ; sinon passer à la section 2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('quick', 'normal', 'forensic', 'hybrid')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  vulnerabilities_found INTEGER DEFAULT 0,
  security_score INTEGER DEFAULT 0,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_timeline ENABLE ROW LEVEL SECURITY;

-- Policies de base (éviter les doublons : DROP IF EXISTS puis CREATE)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can create their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update their own scans" ON public.scans;
CREATE POLICY "Users can view their own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scans" ON public.scans FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scans" ON public.scans;
CREATE POLICY "Users can delete own scans" ON public.scans FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_timeline;
DROP POLICY IF EXISTS "Users can create their own activity" ON public.activity_timeline;
CREATE POLICY "Users can view their own activity" ON public.activity_timeline FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own activity" ON public.activity_timeline FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', NULL))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON public.scans(status);
CREATE INDEX IF NOT EXISTS idx_reports_scan_id ON public.reports(scan_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity_timeline(user_id);


-- -----------------------------------------------------------------------------
-- 2) Colonnes pour les rapports et le stockage (scans)
-- -----------------------------------------------------------------------------
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS report_html TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS scan_data JSONB,
  ADD COLUMN IF NOT EXISTS current_phase TEXT,
  ADD COLUMN IF NOT EXISTS report_pdf_path TEXT;

COMMENT ON COLUMN public.scans.report_html IS 'Complete HTML report content generated after scan completion';
COMMENT ON COLUMN public.scans.storage_path IS 'Path to ZIP file in Supabase Storage (scan-results bucket)';
COMMENT ON COLUMN public.scans.scan_data IS 'Complete scan data JSON (violations, summary, etc.)';
COMMENT ON COLUMN public.scans.current_phase IS 'Current scanning phase for real-time progress';
COMMENT ON COLUMN public.scans.report_pdf_path IS 'Path to PDF report in Supabase Storage (scan-results bucket)';

CREATE INDEX IF NOT EXISTS idx_scans_report_html_not_null ON public.scans(id) WHERE report_html IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 3) Colonnes company / risk (scans)
-- -----------------------------------------------------------------------------
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS company_sector TEXT,
  ADD COLUMN IF NOT EXISTS company_revenue_bracket TEXT,
  ADD COLUMN IF NOT EXISTS company_employee_bracket TEXT,
  ADD COLUMN IF NOT EXISTS risk_level TEXT;

-- Autoriser le type 'hybrid' dans scan_type (supprimer l’ancienne contrainte si elle existe)
ALTER TABLE public.scans DROP CONSTRAINT IF EXISTS scans_scan_type_check;
ALTER TABLE public.scans ADD CONSTRAINT scans_scan_type_check
  CHECK (scan_type IN ('quick', 'normal', 'forensic', 'hybrid'));

CREATE INDEX IF NOT EXISTS idx_scans_risk_level ON public.scans(risk_level);
CREATE INDEX IF NOT EXISTS idx_scans_company_sector ON public.scans(company_sector);


-- -----------------------------------------------------------------------------
-- 4) Profils : abonnements et colonnes manquantes
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS scans_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scans_limit INTEGER DEFAULT 999999,
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Politiques profiles (insert pour auth)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- -----------------------------------------------------------------------------
-- 5) Trigger : incrémenter scans_used à la fin d’un scan
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_scan_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.profiles
    SET scans_used = COALESCE(scans_used, 0) + 1, updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_scan_completed ON public.scans;
CREATE TRIGGER on_scan_completed
  AFTER UPDATE ON public.scans
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_scan_count();


-- -----------------------------------------------------------------------------
-- 6) Créer les profils manquants pour les utilisateurs existants
-- -----------------------------------------------------------------------------
INSERT INTO public.profiles (id, email, full_name, role, subscription_status, subscription_plan, scans_used, scans_limit)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  'user',
  'free',
  'free',
  0,
  999999
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 7) Storage : créer le bucket (à faire dans Dashboard > Storage si pas déjà fait)
--    Nom du bucket : scan-results
--    Privé (pas public)
--    Politiques optionnelles pour que les users accèdent à leurs fichiers :
-- -----------------------------------------------------------------------------
-- (Exemple de policies storage – à adapter selon le nom du bucket)
-- CREATE POLICY "Users can read own scan files"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'scan-results' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can upload own scan files"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'scan-results' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own scan files"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'scan-results' AND auth.uid()::text = (storage.foldername(name))[1]);


-- =============================================================================
-- Fin. Vérifier qu’il n’y a pas d’erreur (notamment sur DROP CONSTRAINT).
-- Si une contrainte scan_type a un autre nom, exécuter à part :
--   ALTER TABLE public.scans DROP CONSTRAINT IF EXISTS scans_scan_type_check;
--   ALTER TABLE public.scans ADD CONSTRAINT scans_scan_type_check
--   CHECK (scan_type IN ('quick', 'normal', 'forensic', 'hybrid'));
-- =============================================================================
