-- Migration: Setup media storage bucket and policies
-- Date: 2025-04-08

-- This migration creates a 'media' bucket for post image uploads
-- and sets up the necessary storage policies.

-- Create the media bucket if it doesn't exist
-- (This may need to be done manually through the Supabase dashboard
-- if your instance doesn't allow bucket creation through SQL)

-- Set up storage policies for the media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow uploads to posts/{user_id}/* path
  (bucket_id = 'media' AND (storage.foldername(name))[1] = 'posts' AND (storage.foldername(name))[2] = auth.uid()::text)
);

-- Policy: Anyone can view media
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Users can update their own media
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = 'posts' AND 
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = 'posts' AND 
  (storage.foldername(name))[2] = auth.uid()::text
);
