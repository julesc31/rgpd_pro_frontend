-- Migration: Add company info columns to scans table
-- Required for GDPR fine estimation based on company size and sector

-- Add new columns for company information
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS company_sector TEXT,
ADD COLUMN IF NOT EXISTS company_revenue_bracket TEXT CHECK (company_revenue_bracket IN ('SMALL', 'MEDIUM', 'LARGE')),
ADD COLUMN IF NOT EXISTS company_employee_bracket TEXT CHECK (company_employee_bracket IN ('SMALL', 'MEDIUM', 'LARGE')),
ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

-- Update scan_type constraint to include 'hybrid'
ALTER TABLE public.scans
DROP CONSTRAINT IF EXISTS scans_scan_type_check;

ALTER TABLE public.scans
ADD CONSTRAINT scans_scan_type_check
CHECK (scan_type IN ('quick', 'normal', 'forensic', 'hybrid'));

-- Add index for risk_level for faster filtering
CREATE INDEX IF NOT EXISTS idx_scans_risk_level ON public.scans(risk_level);

-- Add index for company_sector for analytics
CREATE INDEX IF NOT EXISTS idx_scans_company_sector ON public.scans(company_sector);

-- Comment on columns for documentation
COMMENT ON COLUMN public.scans.company_sector IS 'Company sector key (e.g., technology, healthcare, finance_insurance)';
COMMENT ON COLUMN public.scans.company_revenue_bracket IS 'Revenue bracket: SMALL (<1B), MEDIUM (1-10B), LARGE (>10B)';
COMMENT ON COLUMN public.scans.company_employee_bracket IS 'Employee bracket: SMALL (<1K), MEDIUM (1K-10K), LARGE (>10K)';
COMMENT ON COLUMN public.scans.risk_level IS 'Scan result risk level: LOW, MEDIUM, HIGH, CRITICAL';
