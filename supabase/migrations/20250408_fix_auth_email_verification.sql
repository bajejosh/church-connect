-- MIGRATION: Fix Auth Email Verification URLs
-- This migration updates the Supabase Auth settings to work with any domain/port instead of hardcoded localhost
-- It updates the site_url, redirect URLs, and email templates to use dynamic URLs

-- Step 1: Update the site URL and redirect URLs in auth config
UPDATE auth.config
SET 
  -- Set site_url to use the SITE_URL env var or a placeholder that will be updated by the app
  site_url = COALESCE(
    current_setting('app.site_url', true),
    '{{ .SiteURL }}'
  ),
  -- Add multiple possible redirect URLs to support various environments
  additional_redirect_urls = array_append(
    array_append(
      array_append(
        array_remove(additional_redirect_urls, 'http://localhost:5173/dashboard'),
        '{{ .SiteURL }}/dashboard'
      ),
      '{{ .SiteURL }}/auth/callback'
    ),
    '*'
  );

-- Step 2: Update email templates to use dynamic site URL instead of hardcoded URLs
UPDATE auth.email_templates
SET
  template = REPLACE(
    template,
    'http://localhost:5173/dashboard',
    '{{ .SiteURL }}/dashboard'
  )
WHERE template LIKE '%http://localhost:5173/dashboard%';

UPDATE auth.email_templates
SET
  template = REPLACE(
    template,
    'http://localhost:5173/auth',
    '{{ .SiteURL }}/auth'
  )
WHERE template LIKE '%http://localhost:5173/auth%';

UPDATE auth.email_templates
SET
  template = REPLACE(
    template,
    'http://localhost:5173/',
    '{{ .SiteURL }}/'
  )
WHERE template LIKE '%http://localhost:5173/%';

-- Step 3: Create a function to update site URL dynamically based on request origin
CREATE OR REPLACE FUNCTION auth.set_site_url()
RETURNS trigger AS $$
DECLARE
  request_origin text;
BEGIN
  -- Try to get the origin from the request headers
  request_origin := current_setting('request.headers', true)::json->'origin'::text;
  
  -- Clean up the origin string and ensure it doesn't have quotes
  request_origin := REPLACE(REPLACE(request_origin, '"', ''), '''', '');
  
  -- Only update if the origin is valid
  IF request_origin IS NOT NULL AND request_origin != '' THEN
    -- Set the site_url to the current request origin if it's not already set correctly
    IF (SELECT site_url FROM auth.config) != request_origin THEN
      UPDATE auth.config SET site_url = request_origin;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS before_auth_request ON auth.sessions;

-- Create a trigger to set the site URL on auth requests
CREATE TRIGGER before_auth_request
BEFORE INSERT ON auth.sessions
FOR EACH ROW
EXECUTE FUNCTION auth.set_site_url();

-- Step 4: Update the system config to enable custom email templates (if not already enabled)
UPDATE auth.config SET 
  mailer_autoconfirm = false,
  mailer_otp_enabled = true,
  sms_autoconfirm = false,
  sms_provider = 'twilio',
  sms_otp_enabled = false;

-- Step 5: Set environment variables for email verification callback
-- Note: These will be applied only if your Supabase setup supports it
SELECT exec_sql($sql$
  DO $$
  BEGIN
    BEGIN
      PERFORM set_config('app.site_url', current_setting('SUPABASE_PUBLIC_URL', true), false);
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignore errors if env var not available
    END;
  END $$;
$sql$);
