-- Étape 1: Nettoyer complètement
DROP TABLE IF EXISTS public.activity_timeline CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.scans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Étape 2: Créer la table profiles SANS contraintes
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Étape 3: Insérer TON profil immédiatement
INSERT INTO public.profiles (id, email, full_name, role, subscription_status)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'admin',
  'premium'
FROM auth.users
WHERE email = 'julien.escrouzailles@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  subscription_status = EXCLUDED.subscription_status;

-- Étape 4: Créer les autres tables
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_url TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('quick', 'normal', 'forensic')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'stopped')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  report_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL,
  vulnerabilities_found INTEGER DEFAULT 0,
  security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
  report_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Étape 5: Ajouter les contraintes de clés étrangères
ALTER TABLE public.scans ADD CONSTRAINT scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD CONSTRAINT reports_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.scans(id) ON DELETE CASCADE;
ALTER TABLE public.activity_timeline ADD CONSTRAINT activity_timeline_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Étape 6: Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_timeline ENABLE ROW LEVEL SECURITY;

-- Étape 7: Politiques RLS simples
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can view own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans" ON public.scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scans" ON public.scans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = reports.scan_id AND scans.user_id = auth.uid())
);

CREATE POLICY "Users can view own activity" ON public.activity_timeline FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own activity" ON public.activity_timeline FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Étape 8: Créer le trigger pour les futurs utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Étape 9: Index pour les performances
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_status ON public.scans(status);
CREATE INDEX idx_reports_scan_id ON public.reports(scan_id);
CREATE INDEX idx_activity_user_id ON public.activity_timeline(user_id);

-- Étape 10: Permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
