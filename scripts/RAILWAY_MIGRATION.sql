-- ============================================================================
-- RGPD_PRO — Migration Railway PostgreSQL
-- À exécuter dans Railway → votre base PostgreSQL → "Query" tab
-- ============================================================================

-- Table des utilisateurs (remplace Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  full_name     TEXT        DEFAULT '',
  role          TEXT        NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Table des profils (données métier liées aux utilisateurs)
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company             TEXT,
  subscription_plan   TEXT        DEFAULT 'free',
  scans_used          INT         DEFAULT 0,
  scans_limit         INT         DEFAULT 999999,
  subscription_status TEXT        DEFAULT 'free',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger : créer un profil automatiquement à chaque nouvel utilisateur
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Table des scans
CREATE TABLE IF NOT EXISTS scans (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_url                TEXT        NOT NULL,
  scan_type                 TEXT        NOT NULL DEFAULT 'standard',
  status                    TEXT        NOT NULL DEFAULT 'pending',
  progress                  INT         DEFAULT 0,
  risk_level                TEXT,
  current_phase             TEXT,
  company_sector            TEXT,
  company_revenue_bracket   TEXT,
  company_employee_bracket  TEXT,
  scan_logs                 JSONB,
  scan_data                 JSONB,
  report_html               TEXT,
  storage_path              TEXT,
  report_pdf_path           TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scans_user_id   ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_status    ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created   ON scans(created_at DESC);

-- Table des rapports (optionnel, si le backend en a besoin)
CREATE TABLE IF NOT EXISTS reports (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id               UUID        REFERENCES scans(id) ON DELETE CASCADE,
  vulnerabilities_found INT         DEFAULT 0,
  severity              TEXT,
  security_score        INT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table de l'activité (optionnel)
CREATE TABLE IF NOT EXISTS activity_timeline (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,
  activity_type   TEXT        NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CRÉER UN PREMIER ADMIN (remplacer les valeurs)
-- Le password_hash ci-dessous correspond à "ChangeMe123!" — À CHANGER !
-- Générer avec : node -e "require('bcryptjs').hash('VotreMotDePasse', 12).then(console.log)"
-- ============================================================================
-- INSERT INTO users (email, password_hash, full_name, role)
-- VALUES ('admin@mondomaine.fr', '$2a$12$...', 'Admin', 'admin');
