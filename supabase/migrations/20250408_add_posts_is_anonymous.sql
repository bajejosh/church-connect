-- Add is_anonymous and categories columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';