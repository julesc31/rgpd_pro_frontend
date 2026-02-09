-- =====================================================
-- RESET COMPLET DE LA BASE DE DONNÉES RGPDSCAN
-- =====================================================

-- 1. SUPPRESSION DE TOUT
DROP TABLE IF EXISTS public.activity_timeline CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.scans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. CRÉATION DES TABLES

-- Table profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    company TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table scans
CREATE TABLE public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('quick', 'normal', 'forensic')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'stopped')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    report_html TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    vulnerabilities_found INTEGER DEFAULT 0,
    security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
    report_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table activity_timeline
CREATE TABLE public.activity_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEX POUR PERFORMANCES
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_status ON public.scans(status);
CREATE INDEX idx_reports_scan_id ON public.reports(scan_id);
CREATE INDEX idx_activity_user_id ON public.activity_timeline(user_id);

-- 4. POLITIQUES RLS SIMPLES (SANS RÉCURSION)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_timeline ENABLE ROW LEVEL SECURITY;

-- Profiles: utilisateurs voient leur propre profil
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Scans: utilisateurs voient leurs propres scans
CREATE POLICY "Users can view own scans"
    ON public.scans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scans"
    ON public.scans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
    ON public.scans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
    ON public.scans FOR DELETE
    USING (auth.uid() = user_id);

-- Reports: utilisateurs voient les rapports de leurs scans
CREATE POLICY "Users can view own reports"
    ON public.reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.scans
            WHERE scans.id = reports.scan_id
            AND scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.scans
            WHERE scans.id = reports.scan_id
            AND scans.user_id = auth.uid()
        )
    );

-- Activity: utilisateurs voient leur propre activité
CREATE POLICY "Users can view own activity"
    ON public.activity_timeline FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity"
    ON public.activity_timeline FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. TRIGGER POUR CRÉER AUTOMATIQUEMENT LES PROFILS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, subscription_status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user',
        'free'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
