-- Final fix for profiles table RLS policies to ensure proper access
-- Date: 2025-04-09

-- First, let's ensure all existing problematic policies are removed
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Create simplified but effective policies for profiles

-- Allow ALL users to view ALL profiles (simplifies things for notifications and avatar display)
-- This is safe since profiles only contain public information (name, avatar)
CREATE POLICY "Anyone can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Make sure Row Level Security is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a helper function to verify that a profile exists
-- This helps our application logic identify missing profiles
CREATE OR REPLACE FUNCTION public.profile_exists(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = profile_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.profile_exists TO authenticated;

-- Function to ensure a profile exists for a user
-- Will create a profile if one doesn't exist
CREATE OR REPLACE FUNCTION public.ensure_profile(
  user_id UUID,
  user_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Check if profile exists
  SELECT id INTO profile_id FROM public.profiles WHERE id = user_id;
  
  -- If no profile exists, create one
  IF profile_id IS NULL THEN
    INSERT INTO public.profiles (id, full_name)
    VALUES (user_id, COALESCE(user_name, 'User'))
    RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.ensure_profile TO authenticated;

-- Create a test notification for the current user (if one doesn't exist)
-- This helps ensure the notification system is working
CREATE OR REPLACE FUNCTION public.create_test_notification() 
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_notification_id UUID;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  -- Check if a test notification already exists for this user
  SELECT id INTO v_notification_id 
  FROM public.notifications 
  WHERE recipient_id = v_user_id AND type = 'test'
  LIMIT 1;
  
  -- If a test notification doesn't exist, create one
  IF v_notification_id IS NULL THEN
    INSERT INTO public.notifications (
      recipient_id,
      actor_id,
      type,
      resource_type,
      data
    ) VALUES (
      v_user_id,
      v_user_id,
      'test',
      'system',
      jsonb_build_object('message', 'This is a test notification to verify the system is working')
    )
    RETURNING id INTO v_notification_id;
  END IF;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;
