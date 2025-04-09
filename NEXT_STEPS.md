# Church Connect - Next Steps

## Important Notice
**Current Error:** If you're seeing errors with UserAvatar or notifications, please run the latest fix scripts:

To fix profile and notification issues:
1. Apply these migrations to your Supabase instance in this order:
   - `20250409_fix_profiles_rls_final.sql` - Fixes profile permission issues
   - `20250409_add_test_notifications.sql` - Creates test notifications
2. Replace your `src/components/common/UserAvatar.jsx` file with the fixed version from `UserAvatar.jsx.fix`
3. Refresh your application

These migrations fix:
- Profile permission issues causing "406 Not Acceptable" errors
- Missing notifications
- Avatar display problems

**Previous Error:** If you're seeing a database error related to notifications (such as `42703: column "recipient_id" does not exist`), you need to run the notifications system fix migration!

To fix this issue:
1. Apply the `20250409_add_notifications_table_fix.sql` migration to your Supabase instance

**Previous Error:** If you're seeing a function not found error related to `toggle_post_pin`, you need to run the pin post migration!

To fix this issue:
1. Apply the `20250409_add_post_pinning.sql` migration to your Supabase instance

**Previous Error:** If you're seeing `PGRST204: Could not find the 'cover_position' column` error, you need to run the database migrations!

Follow these steps:
1. Apply the `20250408_add_image_positioning.sql` migration to your Supabase instance

See the migration README for more details.

## Recent Updates
- Fixed profile RLS policies to ensure avatars display correctly
- Added test notifications to verify the notification system
- Improved UserAvatar component to handle missing profiles gracefully
- Created more robust notifications system fix migration that adapts to the current database state
- Added proper notifications system migration to fix database relationship errors
- Added comprehensive notifications system documentation
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
The app now has a working notifications system with correct profile permissions, improved profile image handling, more robust notification creation, fixed prayer request creation with a more intuitive interface and scrollable modal, better sidebar layout with no gaps or width inconsistencies, improved dark mode support, better prayer request handling, fixed church management, enhanced media embedding capabilities, and more robust Supabase API interactions.

## Next Priorities
1. **User Avatar Enhancements** - Add fallback mechanism for missing profiles and better error handling
2. **Notifications System Enhancements** - Add push notifications and email notifications for important updates
3. **Profile Page Improvements** - ✅ Added bio field, improved posts display
4. **Fix Auth Path Issues** - Apply migration scripts for base path handling
5. **Enhance Chord Charts** - Add diagrams and Nashville number system support
6. **Improve Lyrics Display** - Add printable view and better performance
7. **Media Embedding Enhancements** - Add Spotify and SoundCloud support
8. **Improve Error Handling** - Add consistent error messages for API operations
9. **Fix Navigation UX issues** - ✅ Fixed profile redirection, image viewing, and icon alignment
10. **Dark Mode Refinements** - ✅ Fixed sidebar styling, ensure consistent dark mode experience throughout the app
11. **Mobile Layout Improvements** - ✅ Fixed sidebar layout issues on mobile and desktop views
12. **Prayer Request UX Improvements** - ✅ Added more intuitive creation flow with global/church toggle and scrollable modal

## Database Migrations
- Run database migration scripts in the supabase/migrations directory in this order:
1. `20250409_fix_profiles_rls_final.sql` - Fixes profile permissions
2. `20250409_add_test_notifications.sql` - Adds test notifications
3. `20250409_add_notifications_table_fix.sql` - Fixes notifications table structure
4. `20250409_add_post_pinning.sql` - Enables post pinning functionality
5. `20250408_add_profile_bio.sql` - Adds bio column to profiles
6. `20250408_add_profile_cover_url.sql` - Adds missing cover_url column
7. `20250408_add_image_positioning.sql` - Adds avatar_position and cover_position columns

## Component Updates
- Replace `src/components/common/UserAvatar.jsx` with the fixed version
- Create comprehensive notifications system with real-time updates
- Create ProfileCard, ProfileTabs, and ProfileSettings components
- ✅ Refactor Prayer components with atomic design principles
- Create reusable media embedding components
- Update layout components with consistent dark mode support
- Standardize API error handling and user feedback
