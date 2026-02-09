-- Migration: Add report PDF storage path (PDF generated at end of scan, stored in Supabase Storage)
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS report_pdf_path TEXT;

COMMENT ON COLUMN public.scans.report_pdf_path IS 'Path to PDF report in Supabase Storage (scan-results bucket), e.g. user_id/scan_id/rapport-rgpd-domain.pdf';
