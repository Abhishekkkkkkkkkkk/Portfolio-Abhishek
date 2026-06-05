-- =========================================================================
-- Supabase Database Webhook setup for Blog Subscriber Notifications
-- =========================================================================
-- Run this script in your Supabase SQL Editor to link blog inserts
-- to the send-blog-notification Edge Function automatically.
--
-- Alternatively, you can easily configure this via the Supabase Dashboard:
-- 1. Go to "Database" -> "Webhooks" (under the Alpha/Beta features)
-- 2. Click "Enable Webhooks" (if not already enabled)
-- 3. Click "Create Webhook"
--    - Name: send_blog_notification_webhook
--    - Table: blogs
--    - Events: Check "Insert"
--    - Type: "Supabase Edge Function"
--    - Edge Function: Select "send-blog-notification"
--    - Method: POST
--    - Timeout: 5000
-- 4. Click "Save"
-- =========================================================================

-- 1. Enable the pg_net extension (allows async non-blocking HTTP requests from Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the webhook trigger function
CREATE OR REPLACE FUNCTION public.tr_on_blog_inserted()
RETURNS TRIGGER AS $$
DECLARE
  -- Replace these placeholders with your actual Supabase configurations.
  -- You can find these in Project Settings -> API in your Supabase dashboard.
  PROJECT_REF TEXT := 'llheaxpkvffcalicxkvk'; 
  ANON_KEY TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaGVheHBrdmZmY2FsaWN4a3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTM0NTUsImV4cCI6MjA5NTk2OTQ1NX0.3HC30_ApQRGw-TWJ7aLQywMB2YBSY9y4nWn0g8PhAPI'; -- Paste your ANON key here
  
  webhook_url TEXT;
  request_headers JSONB;
  request_body JSONB;
BEGIN
  webhook_url := 'https://' || PROJECT_REF || '.supabase.co/functions/v1/send-blog-notification';
  
  request_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || ANON_KEY
  );
  
  request_body := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW)::jsonb
  );

  -- Perform an asynchronous HTTP POST request
  PERFORM net.http_post(
    url := webhook_url,
    headers := request_headers,
    body := request_body,
    timeout_ms := 5000
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ensure webhook execution failure does NOT roll back or block the blog insert transaction
    RAISE WARNING 'Failed to trigger blog notification webhook: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the Database Trigger on the public.blogs table
DROP TRIGGER IF EXISTS on_blog_inserted ON public.blogs;
CREATE TRIGGER on_blog_inserted
  AFTER INSERT ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.tr_on_blog_inserted();

COMMENT ON FUNCTION public.tr_on_blog_inserted() IS 'Invokes the send-blog-notification Edge Function when a new blog is published.';
