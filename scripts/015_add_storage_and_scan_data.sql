-- Migration: Add storage support for scan files
-- Stores ZIP packages in Supabase Storage and scan_data JSON in table

-- 1. Add columns for storage references
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS scan_data JSONB;

-- Comments
COMMENT ON COLUMN public.scans.storage_path IS 'Path to ZIP file in Supabase Storage (scan-results bucket)';
COMMENT ON COLUMN public.scans.scan_data IS 'Complete scan data JSON (violations, summary, etc.)';

-- 2. Create storage bucket for scan results (run this in Supabase Dashboard > Storage)
-- Note: Buckets must be created via Dashboard or using service role API
-- Bucket name: scan-results
-- Public: false (private, requires auth)

-- 3. Storage policies (to be created after bucket exists)
-- These allow authenticated users to access their own scan files

-- Policy: Users can upload their own scan files
-- CREATE POLICY "Users can upload scan files"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'scan-results' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can read their own scan files
-- CREATE POLICY "Users can read own scan files"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'scan-results' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can delete their own scan files
-- CREATE POLICY "Users can delete own scan files"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'scan-results' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );
