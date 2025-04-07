-- Add support for global prayer requests

-- Add is_global column to prayer_requests table
ALTER TABLE prayer_requests
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Add is_global column to posts table for prayer posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Create policy for global prayer requests
CREATE POLICY "Everyone can see global prayer requests"
  ON prayer_requests
  FOR SELECT
  USING (is_global = true AND is_private = false);

-- Create policy for global prayer posts
CREATE POLICY "Everyone can see global prayer posts"
  ON posts
  FOR SELECT
  USING (
    (post_type = 'prayer' AND is_global = true)
    OR 
    (post_type <> 'prayer')
  );

-- Modify RLS policies to handle church_id being null for global prayers
DROP POLICY IF EXISTS "Users can view prayer requests from their church" ON prayer_requests;
CREATE POLICY "Users can view prayer requests from their church"
  ON prayer_requests
  FOR SELECT
  USING (
    (is_global = true)
    OR
    (auth.uid() IN (
      SELECT id FROM profiles WHERE church_id = prayer_requests.church_id
    ))
  );

DROP POLICY IF EXISTS "Users can view prayer posts from their church" ON posts;
CREATE POLICY "Users can view prayer posts from their church"
  ON posts
  FOR SELECT
  USING (
    (post_type = 'prayer' AND is_global = true)
    OR
    (post_type = 'prayer' AND auth.uid() IN (
      SELECT id FROM profiles WHERE church_id = posts.church_id
    ))
    OR
    (post_type <> 'prayer')
  );

-- Modify trigger to handle global prayers (no church_id)
CREATE OR REPLACE FUNCTION assign_prayer_church_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for prayer posts
  IF NEW.post_type = 'prayer' THEN
    IF NEW.is_global = true THEN
      -- Global prayers have null church_id
      NEW.church_id = NULL;
    ELSE
      -- Set church_id from the author's profile if not already set and not global
      IF NEW.church_id IS NULL THEN
        SELECT church_id INTO NEW.church_id
        FROM profiles
        WHERE id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger is in place
DROP TRIGGER IF EXISTS prayer_posts_church_id_trigger ON posts;
CREATE TRIGGER prayer_posts_church_id_trigger
BEFORE INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION assign_prayer_church_id();
