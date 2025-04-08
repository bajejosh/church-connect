-- Migration: Add bio column to profiles table
-- Date: 2025-04-08

-- Add the bio column to store user biographies
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Comment on column
COMMENT ON COLUMN public.profiles.bio IS 'User biography or about me text';
