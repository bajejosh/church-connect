# Notifications System Documentation

## Overview

The Church Connect app includes a notifications system that allows users to receive updates about activities related to their posts, comments, prayers, and social interactions. This document outlines the database schema, API endpoints, and frontend components used to implement this feature.

## Database Schema

### Notifications Table

The notifications table stores all user notifications with the following structure:

```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    data JSONB,
    resource_type TEXT,
    resource_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Key Fields:

- `id`: Unique identifier for the notification
- `recipient_id`: User ID of the notification recipient
- `actor_id`: User ID of the person who triggered the notification
- `type`: Type of notification (like, comment, prayer, follow)
- `read`: Whether the notification has been read
- `data`: Additional JSON data specific to the notification
- `resource_type`: Type of resource the notification relates to (post, comment, etc.)
- `resource_id`: ID of the specific resource
- `created_at`: Timestamp when the notification was created
- `updated_at`: Timestamp when the notification was last updated

### Foreign Key Relationships

The notifications table maintains relationships with:

1. `auth.users` for both `recipient_id` and `actor_id`
2. `public.profiles` for `actor_id` to retrieve actor profile information

### Indexes

For performance optimization, the following indexes are maintained:

- `idx_notifications_recipient_id`: For quick retrieval of a user's notifications
- `idx_notifications_actor_id`: For quick access to notifications from a specific actor
- `idx_notifications_created_at`: For sorting by creation time
- `idx_notifications_read`: For filtering by read status

## Security Policies

Row-level security policies ensure that:

1. Users can only view their own notifications
2. System functions can create notifications for any user
3. Users can only update (mark as read) their own notifications

## Helper Functions

### Creating Notifications

```sql
SELECT create_notification(
  recipient_id := 'uuid-of-recipient',
  actor_id := 'uuid-of-actor',
  type := 'like',
  resource_type := 'post',
  resource_id := 'uuid-of-post',
  data := '{"post_title": "Example post"}'::jsonb
);
```

### Marking Notifications as Read

```sql
SELECT mark_all_notifications_as_read('uuid-of-user');
```

## Frontend Implementation

The notifications component (`src/pages/Notifications.jsx`) handles:

1. Fetching and displaying notifications
2. Marking notifications as read
3. Real-time updates using Supabase's subscription API

### Notification Types

The system supports the following notification types:

- `like`: When someone likes a user's post
- `comment`: When someone comments on a user's post
- `prayer`: When someone prays for a user's post or prayer request
- `follow`: When someone follows the user

### Icons and Display

Each notification type has a specific icon and color:

- Like: Red heart icon
- Comment: Blue comment icon
- Prayer: Purple pray icon
- Follow: Green user-plus icon

## Real-time Updates

Notifications are updated in real-time using Supabase's real-time subscription capabilities:

```javascript
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `recipient_id=eq.${user.id}`,
  }, (payload) => {
    // Add the new notification to the list
    setNotifications(prev => [payload.new, ...prev]);
  })
  .subscribe();
```

## API Usage Examples

### Fetching Notifications

```javascript
const { data, error } = await supabase
  .from('notifications')
  .select(`
    *,
    profiles:actor_id(full_name, avatar_url)
  `)
  .eq('recipient_id', user.id)
  .order('created_at', { ascending: false })
  .limit(20);
```

### Marking Notifications as Read

```javascript
await supabase
  .from('notifications')
  .update({ read: true })
  .in('id', unreadIds);
```

## Integration with Other Features

The notifications system integrates with:

1. **Social Features**: When users like, comment, or follow
2. **Prayer System**: When users pray for prayer requests
3. **Post Management**: When users interact with posts

## Troubleshooting

If notifications are not appearing:

1. Check that the `notifications` table exists
2. Verify the foreign key relationship between `notifications.actor_id` and `profiles`
3. Ensure the appropriate RLS policies are in place
4. Check browser console for API errors

## Future Enhancements

Planned enhancements for the notifications system:

1. Push notifications via web and mobile
2. More granular notification preferences
3. Notification grouping for similar activities
4. Email notifications for high-priority updates
