-- Fix for Global Prayer Requests showing "User" instead of proper author names - Second attempt
-- This version includes additional field checks and handling for null values

-- First check for the root cause - investigate if there are prayer posts with is_anonymous=false but empty author info
DO $$
BEGIN
    -- Check for mismatched posts (posts that should be showing proper author but aren't)
    RAISE NOTICE 'Checking for posts with missing author information...';
    
    -- Update any posts with missing profile information to be marked as anonymous
    UPDATE posts p
    SET is_anonymous = true
    WHERE 
        p.is_anonymous = false AND 
        NOT EXISTS (SELECT 1 FROM profiles WHERE id = p.user_id AND full_name IS NOT NULL);
    
    -- Update any prayer_requests with missing profile information to be marked as anonymous
    UPDATE prayer_requests pr
    SET is_anonymous = true
    WHERE 
        pr.is_anonymous = false AND 
        NOT EXISTS (SELECT 1 FROM profiles WHERE id = pr.user_id AND full_name IS NOT NULL);
END $$;

-- Completely rebuild the feed_items view with improved author handling
DROP VIEW IF EXISTS feed_items CASCADE;
CREATE OR REPLACE VIEW feed_items AS
SELECT 
  p.id,
  p.created_at,
  p.user_id,
  p.church_id,
  p.content,
  p.media_urls,
  p.post_type,
  p.related_id,
  p.is_global,
  COALESCE(p.is_anonymous, false) as is_anonymous,
  'post' as item_type,
  pr.title as prayer_title,
  COALESCE(pr.is_anonymous, false) as prayer_is_anonymous,
  e.title as event_title,
  e.start_time as event_time,
  u.email,
  CASE 
    WHEN COALESCE(p.is_anonymous, false) = true THEN 'Anonymous'::text
    WHEN prof.full_name IS NULL OR prof.full_name = '' THEN 'Anonymous'::text
    ELSE prof.full_name 
  END as full_name,
  CASE 
    WHEN COALESCE(p.is_anonymous, false) = true THEN NULL
    WHEN prof.full_name IS NULL OR prof.full_name = '' THEN NULL
    ELSE prof.avatar_url
  END as avatar_url,
  churches.name as church_name
FROM posts p
LEFT JOIN prayer_requests pr ON p.related_id = pr.id AND p.post_type = 'prayer'
LEFT JOIN events e ON p.related_id = e.id AND p.post_type = 'event'
LEFT JOIN auth.users u ON p.user_id = u.id
LEFT JOIN profiles prof ON p.user_id = prof.id
LEFT JOIN churches ON p.church_id = churches.id;

-- Make sure the posts_with_authors view also correctly handles is_anonymous with improved NULL handling
DROP VIEW IF EXISTS posts_with_authors CASCADE;
CREATE VIEW posts_with_authors AS
SELECT 
  p.*,
  CASE 
    WHEN COALESCE(p.is_anonymous, false) = true THEN 'Anonymous'::text
    WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN 'Anonymous'::text
    ELSE profiles.full_name 
  END as full_name,
  CASE 
    WHEN COALESCE(p.is_anonymous, false) = true THEN NULL
    WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN NULL
    ELSE profiles.avatar_url
  END as avatar_url,
  churches.name as church_name
FROM 
  posts p
LEFT JOIN 
  profiles ON p.user_id = profiles.id
LEFT JOIN 
  churches ON p.church_id = churches.id;
