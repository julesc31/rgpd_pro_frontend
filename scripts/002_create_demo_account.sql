-- Create demo user profile
-- Note: You must first register with email: demo@securescan.com and password: Demo123!
-- Then run this script to populate demo data

-- Insert demo scans
INSERT INTO public.scans (user_id, url, scan_type, status, progress, vulnerabilities_found, created_at, updated_at)
SELECT 
  id,
  'https://example.com',
  'quick',
  'completed',
  100,
  12,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.scans (user_id, url, scan_type, status, progress, vulnerabilities_found, created_at, updated_at)
SELECT 
  id,
  'https://demo-site.com',
  'normal',
  'completed',
  100,
  8,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.scans (user_id, url, scan_type, status, progress, vulnerabilities_found, created_at, updated_at)
SELECT 
  id,
  'https://test-app.io',
  'forensic',
  'running',
  67,
  0,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.scans (user_id, url, scan_type, status, progress, vulnerabilities_found, created_at, updated_at)
SELECT 
  id,
  'https://secure-portal.com',
  'normal',
  'failed',
  45,
  0,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

-- Insert demo reports
INSERT INTO public.reports (user_id, scan_id, title, security_score, critical_count, high_count, medium_count, low_count, vulnerabilities, created_at)
SELECT 
  p.id,
  s.id,
  'Security Report - example.com',
  72,
  2,
  4,
  6,
  8,
  jsonb_build_array(
    jsonb_build_object(
      'id', '1',
      'title', 'SQL Injection Vulnerability',
      'severity', 'critical',
      'description', 'SQL injection vulnerability found in login form',
      'recommendation', 'Use parameterized queries and input validation',
      'affected_url', 'https://example.com/login'
    ),
    jsonb_build_object(
      'id', '2',
      'title', 'Cross-Site Scripting (XSS)',
      'severity', 'high',
      'description', 'Reflected XSS vulnerability in search parameter',
      'recommendation', 'Implement proper output encoding and Content Security Policy',
      'affected_url', 'https://example.com/search'
    ),
    jsonb_build_object(
      'id', '3',
      'title', 'Missing Security Headers',
      'severity', 'medium',
      'description', 'X-Frame-Options and X-Content-Type-Options headers are missing',
      'recommendation', 'Add security headers to prevent clickjacking attacks',
      'affected_url', 'https://example.com'
    ),
    jsonb_build_object(
      'id', '4',
      'title', 'Weak SSL/TLS Configuration',
      'severity', 'high',
      'description', 'Server supports outdated TLS 1.0 protocol',
      'recommendation', 'Disable TLS 1.0 and 1.1, use only TLS 1.2 and 1.3',
      'affected_url', 'https://example.com'
    )
  ),
  NOW() - INTERVAL '2 days'
FROM public.profiles p
JOIN public.scans s ON s.user_id = p.id
WHERE p.email = 'demo@securescan.com' 
  AND s.url = 'https://example.com'
LIMIT 1;

INSERT INTO public.reports (user_id, scan_id, title, security_score, critical_count, high_count, medium_count, low_count, vulnerabilities, created_at)
SELECT 
  p.id,
  s.id,
  'Security Report - demo-site.com',
  85,
  0,
  2,
  3,
  5,
  jsonb_build_array(
    jsonb_build_object(
      'id', '1',
      'title', 'Insecure Cookie Configuration',
      'severity', 'high',
      'description', 'Session cookies missing Secure and HttpOnly flags',
      'recommendation', 'Set Secure and HttpOnly flags on all session cookies',
      'affected_url', 'https://demo-site.com'
    ),
    jsonb_build_object(
      'id', '2',
      'title', 'Information Disclosure',
      'severity', 'medium',
      'description', 'Server version information exposed in HTTP headers',
      'recommendation', 'Remove or obfuscate server version headers',
      'affected_url', 'https://demo-site.com'
    )
  ),
  NOW() - INTERVAL '5 days'
FROM public.profiles p
JOIN public.scans s ON s.user_id = p.id
WHERE p.email = 'demo@securescan.com' 
  AND s.url = 'https://demo-site.com'
LIMIT 1;

-- Insert demo timeline activities
INSERT INTO public.timeline (user_id, activity_type, activity_data, created_at)
SELECT 
  id,
  'scan_started',
  jsonb_build_object('url', 'https://example.com', 'scan_type', 'quick'),
  NOW() - INTERVAL '2 days'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.timeline (user_id, activity_type, activity_data, created_at)
SELECT 
  id,
  'scan_completed',
  jsonb_build_object('url', 'https://example.com', 'vulnerabilities', 12),
  NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.timeline (user_id, activity_type, activity_data, created_at)
SELECT 
  id,
  'report_generated',
  jsonb_build_object('url', 'https://example.com', 'security_score', 72),
  NOW() - INTERVAL '2 days' + INTERVAL '6 minutes'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.timeline (user_id, activity_type, activity_data, created_at)
SELECT 
  id,
  'scan_started',
  jsonb_build_object('url', 'https://demo-site.com', 'scan_type', 'normal'),
  NOW() - INTERVAL '5 days'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.timeline (user_id, activity_type, activity_data, created_at)
SELECT 
  id,
  'scan_completed',
  jsonb_build_object('url', 'https://demo-site.com', 'vulnerabilities', 8),
  NOW() - INTERVAL '5 days' + INTERVAL '15 minutes'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.timeline (user_id, activity_type, activity_data, created_at)
SELECT 
  id,
  'settings_updated',
  jsonb_build_object('setting', 'notifications', 'value', 'enabled'),
  NOW() - INTERVAL '7 days'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;

INSERT INTO public.timeline (user_id, activity_type, activity_data, created_at)
SELECT 
  id,
  'scan_started',
  jsonb_build_object('url', 'https://test-app.io', 'scan_type', 'forensic'),
  NOW() - INTERVAL '1 hour'
FROM public.profiles 
WHERE email = 'demo@securescan.com'
LIMIT 1;
