-- Migration: Add image position columns to profiles table
-- Date: 2025-04-08

-- Add columns for storing image position information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_position JSONB DEFAULT '{"x": 50, "y": 50}'::JSONB,
ADD COLUMN IF NOT EXISTS cover_position JSONB DEFAULT '{"x": 50, "y": 50}'::JSONB;

-- Comment on columns
COMMENT ON COLUMN public.profiles.avatar_position IS 'Stores the position (x,y percentages) of the profile avatar image';
COMMENT ON COLUMN public.profiles.cover_position IS 'Stores the position (x,y percentages) of the profile cover image';
