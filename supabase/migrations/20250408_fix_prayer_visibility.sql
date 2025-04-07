-- Fix prayer visibility between churches
-- This will ensure prayer requests from one church are visible to other members of the same church

-- Create a new RLS policy for prayer_requests
CREATE POLICY "Users can view prayer requests from their church"
  ON prayer_requests
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE church_id = prayer_requests.church_id
    )
  );

-- Create a policy specifically for ensuring prayers show up in feed
CREATE POLICY "Users can view prayer posts from their church"
  ON posts
  FOR SELECT
  USING (
    (post_type = 'prayer' AND auth.uid() IN (
      SELECT id FROM profiles WHERE church_id = posts.church_id
    ))
    OR
    (post_type <> 'prayer')
  );

-- Ensure prayer posts have proper church_id assignment
CREATE OR REPLACE FUNCTION assign_prayer_church_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for prayer posts
  IF NEW.post_type = 'prayer' THEN
    -- Set church_id from the author's profile if not already set
    IF NEW.church_id IS NULL THEN
      SELECT church_id INTO NEW.church_id
      FROM profiles
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure prayer posts get proper church_id
DROP TRIGGER IF EXISTS prayer_posts_church_id_trigger ON posts;
CREATE TRIGGER prayer_posts_church_id_trigger
BEFORE INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION assign_prayer_church_id();
