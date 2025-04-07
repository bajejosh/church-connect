-- MIGRATION: Auth Helper Functions for Base Path Support
-- This migration creates helper functions but doesn't attempt to modify auth tables directly
-- The auth settings should be updated through the Supabase dashboard

-- Create a schema for our helper functions if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app_helpers;

-- Step 1: Create a function to extract the base path from request headers
CREATE OR REPLACE FUNCTION app_helpers.get_base_path()
RETURNS text AS $$
BEGIN
  -- Default base path for our application
  RETURN '/church-connect/';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a function to build a full URL with the correct base path
CREATE OR REPLACE FUNCTION app_helpers.build_url(path text)
RETURNS text AS $$
DECLARE
  base_path text;
BEGIN
  -- Get the base path
  base_path := app_helpers.get_base_path();
  
  -- Remove leading slash from path if it exists
  IF LEFT(path, 1) = '/' THEN
    path := SUBSTRING(path FROM 2);
  END IF;
  
  -- Remove leading slash from base_path if it exists for comparison
  IF LEFT(base_path, 1) = '/' THEN
    base_path := SUBSTRING(base_path FROM 2);
  END IF;
  
  -- If path already starts with the base path, return it as is
  IF position(base_path IN path) = 1 THEN
    RETURN '/' || path;
  END IF;
  
  -- Otherwise, join the base path and the path
  RETURN '/' || base_path || path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a view to describe the current auth configuration
-- This doesn't access any tables, it just returns instructions
CREATE OR REPLACE VIEW app_helpers.auth_settings_help AS
SELECT 
  '/church-connect/' as recommended_base_path,
  'Update Supabase auth settings through the dashboard' as instruction,
  'Site URL should be set to your domain (e.g., https://yourdomain.com)' as site_url_instruction,
  'Redirect URLs should include base path (e.g., https://yourdomain.com/church-connect/auth/callback)' as redirect_url_instruction,
  'You should add multiple redirect URLs for different environments' as multiple_urls_instruction,
  'Add a wildcard URL (*) to support all possible environments' as wildcard_instruction;
