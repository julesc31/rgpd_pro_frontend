-- Supprime les colonnes et tables inutilisées par l'app (garde monitoring_schedules + schedule_id / is_automated)
-- À exécuter dans Supabase SQL Editor.

-- 1) Colonnes inutilisées sur public.scans
ALTER TABLE public.scans
  DROP COLUMN IF EXISTS result,
  DROP COLUMN IF EXISTS evolution,
  DROP COLUMN IF EXISTS external_scan_id,
  DROP COLUMN IF EXISTS report_url,
  DROP COLUMN IF EXISTS evidence_url,
  DROP COLUMN IF EXISTS sector,
  DROP COLUMN IF EXISTS revenue_bracket,
  DROP COLUMN IF EXISTS employee_bracket;

-- 2) Table activity_timeline non utilisée par le flux principal
DROP TABLE IF EXISTS public.activity_timeline;
