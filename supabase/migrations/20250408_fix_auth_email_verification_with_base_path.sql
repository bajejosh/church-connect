-- MIGRATION: Fix Auth Email Verification URLs with Base Path Support
-- This migration updates the Supabase Auth settings to work with any domain/port and base path
-- It fixes the issue with "/church-connect/" base path and updates all URLs accordingly

-- Step 1: Create a function to extract and store the base path configuration
CREATE OR REPLACE FUNCTION auth.set_base_path_config()
RETURNS void AS $$
BEGIN
  -- Set default base path if not already defined
  BEGIN
    PERFORM current_setting('app.base_path');
  EXCEPTION 
    WHEN UNDEFINED_OBJECT THEN
      PERFORM set_config('app.base_path', '/church-connect/', false);
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the function to set base path
SELECT auth.set_base_path_config();

-- Step 2: Update the site URL and redirect URLs in auth config with correct base path
UPDATE auth.config
SET 
  -- Set site_url to use the SITE_URL env var or a placeholder that will be updated by the app
  site_url = COALESCE(
    current_setting('app.site_url', true),
    '{{ .SiteURL }}'
  ),
  -- Add multiple possible redirect URLs to support various environments
  -- Include both with and without the base path for compatibility
  additional_redirect_urls = array_append(
    array_append(
      array_append(
        array_append(
          array_append(
            array_append(
              array_remove(
                array_remove(additional_redirect_urls, 'http://localhost:5173/dashboard'),
                'http://localhost:5173/church-connect/dashboard'
              ),
              '{{ .SiteURL }}/dashboard'
            ),
            '{{ .SiteURL }}/church-connect/dashboard'
          ),
          '{{ .SiteURL }}/auth/callback'
        ),
        '{{ .SiteURL }}/church-connect/auth/callback'
      ),
      '*'
    )
  );

-- Step 3: Update email templates to use dynamic site URL and correct base path
-- First update templates with direct localhost references to use SiteURL variable
UPDATE auth.email_templates
SET
  template = REPLACE(
    template,
    'http://localhost:5173',
    '{{ .SiteURL }}'
  )
WHERE template LIKE '%http://localhost:5173%';

-- Now replace direct dashboard paths with base path included
UPDATE auth.email_templates
SET
  template = REPLACE(
    template,
    '{{ .SiteURL }}/dashboard',
    '{{ .SiteURL }}/church-connect/dashboard'
  )
WHERE template LIKE '%{{ .SiteURL }}/dashboard%'
  AND template NOT LIKE '%{{ .SiteURL }}/church-connect/dashboard%';

-- Update auth paths with base path
UPDATE auth.email_templates
SET
  template = REPLACE(
    template,
    '{{ .SiteURL }}/auth',
    '{{ .SiteURL }}/church-connect/auth'
  )
WHERE template LIKE '%{{ .SiteURL }}/auth%'
  AND template NOT LIKE '%{{ .SiteURL }}/church-connect/auth%';

-- Step 4: Create a function to update site URL dynamically based on request origin
CREATE OR REPLACE FUNCTION auth.set_site_url()
RETURNS trigger AS $$
DECLARE
  request_origin text;
  base_path text;
BEGIN
  -- Try to get the origin from the request headers
  request_origin := current_setting('request.headers', true)::json->'origin'::text;
  
  -- Clean up the origin string and ensure it doesn't have quotes
  request_origin := REPLACE(REPLACE(request_origin, '"', ''), '''', '');
  
  -- Get the configured base path
  BEGIN
    base_path := current_setting('app.base_path', true);
  EXCEPTION 
    WHEN UNDEFINED_OBJECT THEN
      base_path := '/church-connect/';
  END;
  
  -- Only update if the origin is valid
  IF request_origin IS NOT NULL AND request_origin != '' THEN
    -- Set the site_url to the current request origin if it's not already set correctly
    IF (SELECT site_url FROM auth.config) != request_origin THEN
      UPDATE auth.config SET site_url = request_origin;
      
      -- Also update the additional_redirect_urls to include this origin with the base path
      UPDATE auth.config 
      SET additional_redirect_urls = array_append(
        array_append(
          array_append(
            additional_redirect_urls,
            request_origin || '/dashboard'
          ),
          request_origin || base_path || 'dashboard'
        ),
        request_origin || base_path || 'auth/callback'
      );
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

-- Step 5: Update the system config to enable custom email templates (if not already enabled)
UPDATE auth.config SET 
  mailer_autoconfirm = false,
  mailer_otp_enabled = true,
  sms_autoconfirm = false,
  sms_provider = 'twilio',
  sms_otp_enabled = false;

-- Step 6: Set environment variables for email verification callback
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

-- Step 7: Create a view to check the current auth configuration (helpful for debugging)
CREATE OR REPLACE VIEW auth.config_summary AS
SELECT 
  site_url,
  additional_redirect_urls,
  CASE 
    WHEN array_position(additional_redirect_urls, site_url || '/church-connect/dashboard') IS NOT NULL THEN 'Yes' 
    ELSE 'No' 
  END as has_base_path_redirect,
  CASE 
    WHEN array_position(additional_redirect_urls, '*') IS NOT NULL THEN 'Yes' 
    ELSE 'No' 
  END as has_wildcard_redirect
FROM 
  auth.config;

-- Step 8: Create a function that can be called to manually fix the configuration if needed
CREATE OR REPLACE FUNCTION auth.fix_redirect_urls(base_path text DEFAULT '/church-connect/')
RETURNS void AS $$
DECLARE
  current_site_url text;
BEGIN
  -- Get the current site URL
  SELECT site_url INTO current_site_url FROM auth.config;
  
  -- Update the additional_redirect_urls
  UPDATE auth.config 
  SET additional_redirect_urls = array_append(
    array_append(
      array_append(
        array_append(
          array_remove(additional_redirect_urls, current_site_url || '/dashboard'),
          current_site_url || '/dashboard'
        ),
        current_site_url || base_path || 'dashboard'
      ),
      current_site_url || '/auth/callback'
    ),
    current_site_url || base_path || 'auth/callback'
  );
  
  -- Store the base path in app settings
  PERFORM set_config('app.base_path', base_path, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the function to fix URLs with the default base path
SELECT auth.fix_redirect_urls();
