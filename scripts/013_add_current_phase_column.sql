-- Migration: Add current_phase column to scans table
-- For real-time progress updates during scanning

ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS current_phase TEXT;

COMMENT ON COLUMN public.scans.current_phase IS 'Current scanning phase (e.g., "Initialisation du navigateur", "Détection CMP", etc.)';
