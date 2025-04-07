-- Fix for the posts_with_authors view to correctly handle anonymous posts
-- First drop the existing view if it exists
DROP VIEW IF EXISTS posts_with_authors;

-- Then create the view with the correct structure
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
