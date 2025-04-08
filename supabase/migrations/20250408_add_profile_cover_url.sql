-- Migration: Add cover_url column to profiles table
-- Date: 2025-04-08

-- Add the cover_url column to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Update permissions to allow users to update their cover_url
-- Note: This assumes the existing policies already control who can update profiles
