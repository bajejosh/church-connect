-- Create test notifications to verify the system is working
-- Date: 2025-04-09

-- First, make sure our notifications table has the correct structure
DO $$
BEGIN
  -- If the notifications table doesn't exist, create it
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    CREATE TABLE public.notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      data JSONB DEFAULT '{}'::jsonb,
      resource_type TEXT,
      resource_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    
    -- Add indexes for performance
    CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
    CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
    
    -- Enable RLS
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    
    -- Create basic policies
    CREATE POLICY "Users can view their own notifications"
      ON public.notifications
      FOR SELECT
      USING (auth.uid() = recipient_id);
      
    CREATE POLICY "Users can update their own notifications"
      ON public.notifications
      FOR UPDATE
      USING (auth.uid() = recipient_id);
      
    CREATE POLICY "System can create notifications"
      ON public.notifications
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Add test notifications for all users
-- This creates a welcome notification for each user that doesn't already have one
INSERT INTO public.notifications (
  recipient_id,
  actor_id,
  type,
  read,
  data,
  resource_type
)
SELECT 
  p.id AS recipient_id,
  p.id AS actor_id,
  'welcome' AS type,
  false AS read,
  jsonb_build_object(
    'title', 'Welcome to Church Connect',
    'message', 'Thanks for joining! This is a test notification to verify the system is working.'
  ) AS data,
  'system' AS resource_type
FROM 
  public.profiles p
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM public.notifications n 
    WHERE n.recipient_id = p.id AND n.type = 'welcome'
  );

-- Create another test notification - prayer received
-- This simulates someone praying for a user's post
INSERT INTO public.notifications (
  recipient_id,
  actor_id,
  type,
  read,
  data,
  resource_type
)
SELECT 
  p.id AS recipient_id,
  -- Use the first other user we find (or self if none)
  COALESCE(
    (SELECT id FROM public.profiles WHERE id != p.id LIMIT 1),
    p.id
  ) AS actor_id,
  'prayer' AS type,
  false AS read,
  jsonb_build_object(
    'title', 'Someone prayed for you',
    'message', 'A church member has prayed for your prayer request'
  ) AS data,
  'prayer_request' AS resource_type
FROM 
  public.profiles p
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM public.notifications n 
    WHERE n.recipient_id = p.id AND n.type = 'prayer'
  );

-- Function to create a test notification for the current user
CREATE OR REPLACE FUNCTION public.create_test_notification() 
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_notification_id UUID;
  v_other_user_id UUID;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  -- Try to find another user for the actor_id
  SELECT id INTO v_other_user_id 
  FROM public.profiles 
  WHERE id != v_user_id 
  LIMIT 1;
  
  -- If no other user, use self
  IF v_other_user_id IS NULL THEN
    v_other_user_id := v_user_id;
  END IF;
  
  -- Create a test notification
  INSERT INTO public.notifications (
    recipient_id,
    actor_id,
    type,
    read,
    data,
    resource_type
  ) VALUES (
    v_user_id,
    v_other_user_id,
    'test',
    false,
    jsonb_build_object(
      'title', 'Test Notification',
      'message', 'This notification was created to test the system at ' || now()
    ),
    'system'
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;
