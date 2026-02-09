-- Add report_html column to scans table to store complete HTML reports
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS report_html TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.scans.report_html IS 'Complete HTML report content generated after scan completion';

-- Create an index for faster queries when filtering by completed scans with reports
CREATE INDEX IF NOT EXISTS idx_scans_report_html_not_null 
ON public.scans(id) 
WHERE report_html IS NOT NULL;
