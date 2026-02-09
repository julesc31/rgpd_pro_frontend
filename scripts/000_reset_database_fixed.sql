-- =====================================================
-- RESET COMPLET DE LA BASE DE DONNÉES RGPDSCAN
-- Sans récursion infinie dans les RLS
-- =====================================================

-- 1. SUPPRESSION DE TOUT
-- =====================================================

-- Supprimer les politiques RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can create own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can delete own scans" ON public.scans;
DROP POLICY IF EXISTS "Admins can view all scans" ON public.scans;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_timeline;
DROP POLICY IF EXISTS "Users can create own activity" ON public.activity_timeline;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_scans_updated_at ON public.scans;
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Supprimer les tables
DROP TABLE IF EXISTS public.activity_timeline CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.scans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CRÉATION DES TABLES
-- =====================================================

-- Table profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    company TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table scans
CREATE TABLE public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('quick', 'normal', 'forensic')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'stopped')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    report_html TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    vulnerabilities_found INTEGER NOT NULL DEFAULT 0,
    security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
    report_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table activity_timeline
CREATE TABLE public.activity_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FONCTION DE MISE À JOUR DES TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. FONCTION DE CRÉATION AUTOMATIQUE DU PROFIL
-- =====================================================

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

-- 5. TRIGGERS
-- =====================================================

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour mettre à jour updated_at sur profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. POLITIQUES RLS SIMPLES (SANS RÉCURSION)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_timeline ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles (SANS fonction is_admin qui cause la récursion)
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour scans
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

CREATE POLICY "Users can delete own scans"
    ON public.scans
    FOR DELETE
    USING (auth.uid() = user_id);

-- Politiques pour reports
CREATE POLICY "Users can view own reports"
    ON public.reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.scans
            WHERE scans.id = reports.scan_id
            AND scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own reports"
    ON public.reports
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.scans
            WHERE scans.id = reports.scan_id
            AND scans.user_id = auth.uid()
        )
    );

-- Politiques pour activity_timeline
CREATE POLICY "Users can view own activity"
    ON public.activity_timeline
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity"
    ON public.activity_timeline
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 7. INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_status ON public.scans(status);
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX idx_reports_scan_id ON public.reports(scan_id);
CREATE INDEX idx_activity_user_id ON public.activity_timeline(user_id);
CREATE INDEX idx_activity_created_at ON public.activity_timeline(created_at DESC);

-- 8. PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- FIN DU SCRIPT
