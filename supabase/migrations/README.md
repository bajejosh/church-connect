# Database Migrations

This directory contains all the database migrations for the Church Connect application.

## Migration Files

Migrations are applied in order based on the filename prefix. The initial schema is defined in `01_initial_schema.sql`.

### Recent Migrations

- **20250408_add_image_positioning.sql** - Adds JSONB columns `avatar_position` and `cover_position` to the profiles table for image positioning functionality
- **20250408_add_profile_cover_url.sql** - Adds the missing `cover_url` column to the profiles table, which is needed for profile cover photo functionality in the UI
- **20250408_fixed_anonymous_posts.sql** - Fixes issues with anonymous posts display
- **20250408_fix_global_prayer_author_display_v2.sql** - Improves author display for global prayers
- **20250408_fix_auth_email_verification_with_base_path.sql** - Fixes authentication email verification with base path support

## Critical Migrations

The following migrations MUST be applied for key features to work properly:

1. **20250408_add_profile_cover_url.sql** - Required for profile cover photos
2. **20250408_add_image_positioning.sql** - Required for repositioning profile/cover images
3. **20250408_fix_auth_email_verification_with_base_path.sql** - Required for proper authentication

## How to Apply Migrations

To apply migrations to your Supabase instance:

1. Ensure you have the Supabase CLI installed
2. Navigate to the project root directory
3. Run the following command:

```bash
npx supabase db push
```

Alternatively, you can run individual SQL files through the Supabase dashboard SQL editor.

## Development Guidelines

When creating new migrations:

1. Create a new file with a datestamp prefix (YYYYMMDD_description.sql)
2. Include clear comments explaining the purpose of the migration
3. Test the migration locally before pushing to production
4. Document the migration in this README
