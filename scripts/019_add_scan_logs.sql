-- Migration: Ajouter le champ scan_logs pour le suivi en temps réel
-- À exécuter dans Supabase SQL Editor

ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS scan_logs jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_scans_logs ON public.scans USING gin(scan_logs);

COMMENT ON COLUMN public.scans.scan_logs IS 'Tableau des logs du scan en temps réel [{timestamp, level, message, icon}]';
