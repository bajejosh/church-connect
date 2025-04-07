-- Comprehensive fix for global prayer requests
-- This fixes visibility issues between accounts for both global and church-specific prayers

-- First, ensure the is_global column exists in both tables
ALTER TABLE prayer_requests
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Clear existing RLS policies for prayer requests that might be in conflict
DROP POLICY IF EXISTS "Everyone can see global prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Users can view prayer requests from their church" ON prayer_requests;
DROP POLICY IF EXISTS "Everyone can see global prayer posts" ON posts;
DROP POLICY IF EXISTS "Users can view prayer posts from their church" ON posts;

-- Create a default policy for prayer_requests
CREATE POLICY "Default prayer requests policy" ON prayer_requests
  FOR SELECT USING (
    -- Users can see their own prayer requests
    user_id = auth.uid() OR 
    -- Users can see global prayer requests that aren't private
    (is_global = true AND is_private = false) OR
    -- Users can see church prayer requests from their church
    (
      church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()) AND
      (NOT is_private OR user_id = auth.uid())
    )
  );

-- Create an updated policy for prayer posts
DROP POLICY IF EXISTS posts_select_policy ON posts;
CREATE POLICY posts_select_policy ON posts
  FOR SELECT USING (
    -- Users can see their own posts
    user_id = auth.uid() OR
    -- Users can see global prayer posts
    (post_type = 'prayer' AND is_global = true) OR
    -- Users can see posts from their church
    (
      church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()) AND
      (NOT is_private OR user_id = auth.uid())
    )
  );

-- Create a function to synchronize prayer posts with prayer requests
CREATE OR REPLACE FUNCTION sync_prayer_post_from_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Update any posts that reference this prayer request
  UPDATE posts
  SET 
    is_global = NEW.is_global,
    church_id = CASE WHEN NEW.is_global THEN NULL ELSE NEW.church_id END
  WHERE 
    post_type = 'prayer' AND 
    related_id = NEW.id;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to synchronize prayer posts when a prayer request is updated
DROP TRIGGER IF EXISTS sync_prayer_post_trigger ON prayer_requests;
CREATE TRIGGER sync_prayer_post_trigger
AFTER UPDATE ON prayer_requests
FOR EACH ROW
WHEN (OLD.is_global IS DISTINCT FROM NEW.is_global OR OLD.church_id IS DISTINCT FROM NEW.church_id)
EXECUTE FUNCTION sync_prayer_post_from_request();

-- Create a function to synchronize prayer requests with posts
CREATE OR REPLACE FUNCTION sync_prayer_request_from_post()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a prayer post with a related prayer request
  IF NEW.post_type = 'prayer' AND NEW.related_id IS NOT NULL THEN
    -- Update the prayer request to match the post's is_global and church_id settings
    UPDATE prayer_requests
    SET 
      is_global = NEW.is_global,
      church_id = CASE WHEN NEW.is_global THEN NULL ELSE NEW.church_id END
    WHERE 
      id = NEW.related_id;
  END IF;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to synchronize prayer requests when a post is updated
DROP TRIGGER IF EXISTS sync_prayer_request_trigger ON posts;
CREATE TRIGGER sync_prayer_request_trigger
AFTER UPDATE ON posts
FOR EACH ROW
WHEN (
  NEW.post_type = 'prayer' AND 
  NEW.related_id IS NOT NULL AND
  (OLD.is_global IS DISTINCT FROM NEW.is_global OR OLD.church_id IS DISTINCT FROM NEW.church_id)
)
EXECUTE FUNCTION sync_prayer_request_from_post();

-- Update the assign_prayer_church_id function that runs before insert on posts
CREATE OR REPLACE FUNCTION assign_prayer_church_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for prayer posts
  IF NEW.post_type = 'prayer' THEN
    -- If global, set church_id to NULL
    IF NEW.is_global = true THEN
      NEW.church_id = NULL;
    -- If not global and church_id is not set, get it from the user's profile
    ELSIF NEW.church_id IS NULL THEN
      SELECT church_id INTO NEW.church_id
      FROM profiles
      WHERE id = NEW.user_id;
    END IF;
    
    -- If this post is linked to a prayer request, update the prayer request accordingly
    IF NEW.related_id IS NOT NULL THEN
      UPDATE prayer_requests
      SET 
        is_global = NEW.is_global,
        church_id = NEW.church_id
      WHERE 
        id = NEW.related_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is in place for new prayer posts
DROP TRIGGER IF EXISTS prayer_posts_church_id_trigger ON posts;
CREATE TRIGGER prayer_posts_church_id_trigger
BEFORE INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION assign_prayer_church_id();

-- Fix any existing data inconsistencies between prayer_requests and posts
UPDATE prayer_requests
SET is_global = true
WHERE is_global = false AND church_id IS NULL;

UPDATE posts
SET is_global = true
WHERE post_type = 'prayer' AND is_global = false AND church_id IS NULL;

-- Synchronize global flags between linked prayer_requests and posts
UPDATE posts p
SET is_global = pr.is_global
FROM prayer_requests pr
WHERE p.post_type = 'prayer' AND p.related_id = pr.id AND p.is_global != pr.is_global;

UPDATE prayer_requests pr
SET is_global = p.is_global
FROM posts p
WHERE p.post_type = 'prayer' AND p.related_id = pr.id AND p.is_global != pr.is_global;

-- Ensure all global prayer requests have NULL church_id (this is important for RLS)
UPDATE prayer_requests
SET church_id = NULL
WHERE is_global = true AND church_id IS NOT NULL;

UPDATE posts
SET church_id = NULL
WHERE post_type = 'prayer' AND is_global = true AND church_id IS NOT NULL;
