-- Insert Leboncoin.fr Demo Report
-- This script inserts the complete HTML report for the demo account

DO $$
DECLARE
    demo_user_id UUID;
    demo_scan_id UUID;
    report_html TEXT;
BEGIN
    -- Find the demo user from profiles table
    SELECT id INTO demo_user_id 
    FROM profiles 
    WHERE email = 'demo@securescan.com' 
    LIMIT 1;
    
    -- If no demo user found, raise an error
    IF demo_user_id IS NULL THEN
        RAISE EXCEPTION 'Demo user not found. Please create the demo account first at /auth/register';
    END IF;

    -- Check if a scan for leboncoin.fr already exists
    SELECT id INTO demo_scan_id
    FROM scans
    WHERE user_id = demo_user_id 
    AND target_url = 'https://www.leboncoin.fr/'
    LIMIT 1;

    -- Prepare the complete HTML report
    report_html := $HTML$<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Audit RGPD - Leboncoin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
$HTML$;

    -- If scan exists, update it; otherwise create new one
    IF demo_scan_id IS NOT NULL THEN
        -- Update existing scan
        UPDATE scans
        SET 
            report_html = report_html,
            status = 'completed',
            progress = 100,
            completed_at = NOW()
        WHERE id = demo_scan_id;
        
        RAISE NOTICE 'Updated existing scan with ID: %', demo_scan_id;
    ELSE
        -- Insert new scan with the complete HTML report
        INSERT INTO scans (
            user_id,
            target_url,
            scan_type,
            status,
            progress,
            started_at,
            completed_at,
            report_html
        ) VALUES (
            demo_user_id,
            'https://www.leboncoin.fr/',
            'full',
            'completed',
            100,
            NOW() - INTERVAL '2 hours',
            NOW() - INTERVAL '30 minutes',
            report_html
        )
        RETURNING id INTO demo_scan_id;
        
        RAISE NOTICE 'Created new scan with ID: %', demo_scan_id;
    END IF;

    RAISE NOTICE '✅ Demo report successfully inserted!';
    RAISE NOTICE '📊 View the report at: /reports/%/view', demo_scan_id;
    RAISE NOTICE '📋 View all reports at: /reports';
    
END $$;
