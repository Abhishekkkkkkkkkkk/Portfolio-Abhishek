-- =========================================================================
-- Supabase Database Webhook Setup for Subscription Welcome Email
-- =========================================================================
-- Run this script in your Supabase SQL Editor.
-- It sets up a database trigger on the `subscribers` table to call the
-- `send-subscription-welcome` Edge Function.
-- =========================================================================

-- 1. Ensure pg_net extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Drop the old trigger/function if they exist to prevent duplication conflicts
DROP TRIGGER IF EXISTS on_subscriber_inserted ON public.subscribers;
DROP FUNCTION IF EXISTS public.tr_on_subscriber_inserted();

-- 3. Create the webhook trigger function with error logging
CREATE OR REPLACE FUNCTION public.tr_on_subscriber_inserted()
RETURNS TRIGGER AS $$
DECLARE
  PROJECT_REF TEXT := 'llheaxpkvffcalicxkvk'; 
  ANON_KEY TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaGVheHBrdmZmY2FsaWN4a3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTM0NTUsImV4cCI6MjA5NTk2OTQ1NX0.3HC30_ApQRGw-TWJ7aLQywMB2YBSY9y4nWn0g8PhAPI';
  
  webhook_url TEXT;
  request_headers JSONB;
  request_body JSONB;
  req_id BIGINT;
BEGIN
  webhook_url := 'https://' || PROJECT_REF || '.supabase.co/functions/v1/send-subscription-welcome';
  
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

  -- Perform asynchronous HTTP POST request using pg_net.
  SELECT net.http_post(
    webhook_url,
    request_body,
    '{}'::jsonb,
    request_headers,
    5000
  ) INTO req_id;

  -- Log execution status in the central webhook logs table
  INSERT INTO public.webhook_logs (status, error_message, payload)
  VALUES ('SCHEDULED', 'Welcome email request successfully queued with ID: ' || req_id::text, request_body);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log errors to our diagnostics table
    INSERT INTO public.webhook_logs (status, error_message, payload)
    VALUES ('ERROR', SQLERRM, jsonb_build_object('error_state', SQLSTATE, 'error_msg', SQLERRM));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the Database Trigger on public.subscribers
CREATE TRIGGER on_subscriber_inserted
  AFTER INSERT ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.tr_on_subscriber_inserted();

COMMENT ON FUNCTION public.tr_on_subscriber_inserted() IS 'Invokes the send-subscription-welcome Edge Function upon database insert on subscribers.';
