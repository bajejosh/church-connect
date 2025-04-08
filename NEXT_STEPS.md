# Church Connect - Next Steps

## Important Notice
**Current Error:** If you're seeing a function not found error related to `toggle_post_pin`, you need to run the pin post migration!

To fix this issue:
1. Apply the `20250409_add_post_pinning.sql` migration to your Supabase instance
2. Either use the Supabase CLI: `npx supabase db push`
3. Or run the SQL directly in the Supabase SQL editor

Until then, the app will use a fallback method to pin posts, but applying the migration is recommended for better security.

**Previous Error:** If you're seeing `PGRST204: Could not find the 'cover_position' column` error, you need to run the database migrations!

Follow these steps:
1. Apply the `20250408_add_image_positioning.sql` migration to your Supabase instance
2. Either use the Supabase CLI: `npx supabase db push`
3. Or run the SQL directly in the Supabase SQL editor

See the migration README for more details.

## Recent Updates
- Fixed scrollability in the New Prayer Request modal by adding a max height and scrollable content area
- Improved Prayer Requests page with a more intuitive interface for creating global or church-specific prayer requests
- Refactored Prayer Requests into modular components for better code organization
- Fixed sidebar layout issues including the gap at the bottom and inconsistent width
- Fixed sidebar dark mode styling to ensure consistent background colors and eliminate visual glitches
- Added visual pin indicator icon to show when a post is pinned
- Improved post pinning with better database sorting
- Fixed issue with viewing profile and cover images
- Added post pinning functionality to highlight important posts at the top of the feed
- Reorganized Prayer Requests page tabs to use Global/My Church/My Requests as main tabs
- Added swiping functionality to image viewer for easy navigation between multiple post images
- Made profile and cover images viewable in fullscreen modal with swipe support
- Added route for user profiles with IDs to fix profile redirection
- Improved sidebar dark mode styling for better visibility
- Fixed like and pray icons horizontal alignment in the reaction count display
- Added image viewing modal when clicking on post images
- Fixed user profile redirection when clicking on a user's name
- Improved sidebar design with better styling and visual hierarchy
- Fixed like and pray icon alignment in posts using grid layout
- Added edit and delete functionality for posts
- Improved profile UI - fixed spacing and layout issues
- Moved bio directly under church name and role for better visibility
- Added church icon to profile information
- Made Edit Profile button more subtle
- Added image upload functionality to posts
- Fixed profile picture and cover photo positioning with new image repositioning functionality
- Added missing cover_url column to profiles table to fix profile cover photo upload functionality
- Fixed Churches page with dark mode support
- Added church switching and management features
- Fixed prayer request visibility and anonymous display
- Fixed mobile navigation for Churches page
- Added base path handling for authentication
- Fixed auth email verification for multiple domains
- Enhanced chord display with section formatting
- Added YouTube and Suno embedding support
- Improved lyrics display and dark mode support
- Added Supabase REST API utility functions to handle headers properly
- Fixed song update functionality by reverting to Supabase client

## Current Status
The app now has improved prayer request creation with a more intuitive interface and scrollable modal, better sidebar layout with no gaps or width inconsistencies, improved dark mode support, better prayer request handling, fixed church management, enhanced media embedding capabilities, and more robust Supabase API interactions.

## Next Priorities
1. **Profile Page Improvements** - ✅ Added bio field, improved posts display
2. **Fix Auth Path Issues** - Apply migration scripts for base path handling
3. **Enhance Chord Charts** - Add diagrams and Nashville number system support
4. **Improve Lyrics Display** - Add printable view and better performance
5. **Media Embedding Enhancements** - Add Spotify and SoundCloud support
6. **Improve Error Handling** - Add consistent error messages for API operations
7. **Fix Navigation UX issues** - ✅ Fixed profile redirection, image viewing, and icon alignment
8. **Dark Mode Refinements** - ✅ Fixed sidebar styling, ensure consistent dark mode experience throughout the app
9. **Mobile Layout Improvements** - ✅ Fixed sidebar layout issues on mobile and desktop views
10. **Prayer Request UX Improvements** - ✅ Added more intuitive creation flow with global/church toggle and scrollable modal

## Storage Setup
- Create a `media` bucket in Supabase storage for post image uploads
- Configure RLS policies to allow authenticated users to upload to `posts/{user_id}/` path
- Ensure public read access to the `media` bucket for displaying images

## Database Migrations
- Run database migration scripts in the supabase/migrations directory
- Apply 20250408_add_profile_bio.sql to add bio column to profiles
- Apply 20250408_add_profile_cover_url.sql to add missing cover_url column
- Apply 20250408_add_image_positioning.sql to add avatar_position and cover_position columns
- Apply auth email verification fixes
- Run global prayer and anonymous posts fixes

## Component Updates
- Create ProfileCard, ProfileTabs, and ProfileSettings components
- ✅ Refactor Prayer components with atomic design principles
- Create reusable media embedding components
- Update layout components with consistent dark mode support
- Standardize API error handling and user feedback
