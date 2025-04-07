-- Fix for Global Prayer Requests showing "User" instead of proper author names
-- The issue is that the feed_items view doesn't handle profile joins correctly

-- Update the feed_items view to correctly join and display author information
DROP VIEW IF EXISTS feed_items;
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
  p.is_anonymous,
  'post' as item_type,
  pr.title as prayer_title,
  pr.is_anonymous as prayer_is_anonymous,
  e.title as event_title,
  e.start_time as event_time,
  u.email,
  CASE 
    WHEN p.is_anonymous THEN 'Anonymous'::text
    ELSE prof.full_name 
  END as full_name,
  CASE 
    WHEN p.is_anonymous THEN NULL
    ELSE prof.avatar_url
  END as avatar_url,
  churches.name as church_name
FROM posts p
LEFT JOIN prayer_requests pr ON p.related_id = pr.id AND p.post_type = 'prayer'
LEFT JOIN events e ON p.related_id = e.id AND p.post_type = 'event'
LEFT JOIN auth.users u ON p.user_id = u.id
LEFT JOIN profiles prof ON p.user_id = prof.id
LEFT JOIN churches ON p.church_id = churches.id;

-- Make sure the posts_with_authors view also correctly handles is_anonymous
DROP VIEW IF EXISTS posts_with_authors;
CREATE VIEW posts_with_authors AS
SELECT 
  p.*,
  CASE 
    WHEN p.is_anonymous THEN 'Anonymous'::text
    ELSE profiles.full_name 
  END as full_name,
  CASE 
    WHEN p.is_anonymous THEN NULL
    ELSE profiles.avatar_url
  END as avatar_url,
  churches.name as church_name
FROM 
  posts p
LEFT JOIN 
  profiles ON p.user_id = profiles.id
LEFT JOIN 
  churches ON p.church_id = churches.id;
