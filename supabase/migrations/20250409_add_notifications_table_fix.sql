-- First, let's check if the notifications table exists
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
    ) INTO table_exists;

    -- If the table already exists, we'll alter it
    IF table_exists THEN
        -- Check if recipient_id column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'recipient_id'
        ) THEN
            -- Add recipient_id column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;

        -- Check if actor_id column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'actor_id'
        ) THEN
            -- Add actor_id column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;

        -- Check if read column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'read'
        ) THEN
            -- Add read column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN read BOOLEAN DEFAULT false;
        END IF;

        -- Check if type column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'type'
        ) THEN
            -- Add type column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN type TEXT;
        END IF;

        -- Check if data column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'data'
        ) THEN
            -- Add data column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN data JSONB DEFAULT '{}'::jsonb;
        END IF;

        -- Check if resource_type column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'resource_type'
        ) THEN
            -- Add resource_type column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN resource_type TEXT;
        END IF;

        -- Check if resource_id column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'resource_id'
        ) THEN
            -- Add resource_id column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN resource_id UUID;
        END IF;

        -- Check if created_at column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'created_at'
        ) THEN
            -- Add created_at column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
        END IF;

        -- Check if updated_at column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications' 
            AND column_name = 'updated_at'
        ) THEN
            -- Add updated_at column if it doesn't exist
            ALTER TABLE public.notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
        END IF;
    ELSE
        -- If the table doesn't exist, create it from scratch
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
    END IF;
END
$$;

-- Create indexes for performance if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_recipient_id') THEN
        CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_actor_id') THEN
        CREATE INDEX idx_notifications_actor_id ON public.notifications(actor_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_created_at') THEN
        CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_read') THEN
        CREATE INDEX idx_notifications_read ON public.notifications(read);
    END IF;
END
$$;

-- Add foreign key relationship between profiles and notifications if it doesn't exist
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_notifications_profiles_actor'
        AND table_name = 'notifications'
        AND table_schema = 'public'
    ) INTO constraint_exists;
    
    IF NOT constraint_exists THEN
        BEGIN
            ALTER TABLE public.notifications
            ADD CONSTRAINT fk_notifications_profiles_actor
            FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
        END;
    END IF;
END
$$;

-- Enable RLS if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can view their own notifications'
    ) THEN
        CREATE POLICY "Users can view their own notifications"
        ON public.notifications
        FOR SELECT
        USING (auth.uid() = recipient_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'System can create notifications'
    ) THEN
        CREATE POLICY "System can create notifications"
        ON public.notifications
        FOR INSERT
        WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can update their own notifications'
    ) THEN
        CREATE POLICY "Users can update their own notifications"
        ON public.notifications
        FOR UPDATE
        USING (auth.uid() = recipient_id);
    END IF;
END
$$;

-- Create or replace function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE recipient_id = p_user_id AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace notification trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'set_notifications_updated_at'
    ) THEN
        CREATE TRIGGER set_notifications_updated_at
        BEFORE UPDATE ON public.notifications
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating trigger: %', SQLERRM;
END
$$;

-- Create or replace function for creating notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_recipient_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't create self-notifications
  IF p_recipient_id = p_actor_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (
    recipient_id,
    actor_id,
    type,
    resource_type,
    resource_id,
    data
  ) VALUES (
    p_recipient_id,
    p_actor_id,
    p_type,
    p_resource_type,
    p_resource_id,
    p_data
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
