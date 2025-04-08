-- Add pinned field to posts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_pinned') THEN
        ALTER TABLE posts ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
END$$;

-- Update the posts_with_authors view to include the pinned field
CREATE OR REPLACE VIEW posts_with_authors AS
SELECT 
  p.*,
  pr.full_name,
  pr.avatar_url,
  c.name AS church_name
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN churches c ON p.church_id = c.id;

-- Create an index for faster sorting by pinned status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_is_pinned'
    ) THEN
        CREATE INDEX idx_posts_is_pinned ON posts(is_pinned);
    END IF;
END$$;

-- Update the function to toggle pinned status
CREATE OR REPLACE FUNCTION toggle_post_pin(post_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status BOOLEAN;
  post_author_id UUID;
BEGIN
  -- Get the author of the post
  SELECT user_id INTO post_author_id FROM posts WHERE id = post_id_param;
  
  -- Check if the user is the author of the post
  IF post_author_id <> user_id_param THEN
    RAISE EXCEPTION 'Only the author can pin or unpin a post';
  END IF;
  
  -- Get current pinned status
  SELECT is_pinned INTO current_status FROM posts WHERE id = post_id_param;
  
  -- Toggle the status
  UPDATE posts SET is_pinned = NOT COALESCE(current_status, FALSE) WHERE id = post_id_param;
  
  -- Return the new status
  RETURN NOT COALESCE(current_status, FALSE);
END;
$$;