-- =========================================================================
-- Supabase Database Webhook setup with Diagnostic Logging
-- =========================================================================
-- Run this updated script in your Supabase SQL Editor.
-- It creates a logging table `public.webhook_logs` to capture database trigger
-- executions and any errors that occur.
-- =========================================================================

-- 1. Enable the pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the diagnostic logging table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id SERIAL PRIMARY KEY,
  event_time TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL,         -- 'SCHEDULED', 'ERROR'
  error_message TEXT,
  payload JSONB
);

-- Enable read and write access for logging (idempotent)
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all" ON public.webhook_logs;
CREATE POLICY "Enable read access for all" ON public.webhook_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all" ON public.webhook_logs;
CREATE POLICY "Enable insert access for all" ON public.webhook_logs FOR INSERT WITH CHECK (true);

-- 3. Drop the old trigger/function if they exist
DROP TRIGGER IF EXISTS on_blog_inserted ON public.blogs;
DROP FUNCTION IF EXISTS public.tr_on_blog_inserted();

-- 4. Create the webhook trigger function with error logging
CREATE OR REPLACE FUNCTION public.tr_on_blog_inserted()
RETURNS TRIGGER AS $$
DECLARE
  PROJECT_REF TEXT := 'llheaxpkvffcalicxkvk'; 
  ANON_KEY TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaGVheHBrdmZmY2FsaWN4a3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTM0NTUsImV4cCI6MjA5NTk2OTQ1NX0.3HC30_ApQRGw-TWJ7aLQywMB2YBSY9y4nWn0g8PhAPI';
  
  webhook_url TEXT;
  request_headers JSONB;
  request_body JSONB;
  req_id BIGINT;
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

  -- Perform asynchronous HTTP POST request using pg_net.
  -- Using POSITIONAL parameters to bypass version-specific parameter name differences
  -- (e.g. timeout_milliseconds vs timeout_ms).
  SELECT net.http_post(
    webhook_url,
    request_body,
    '{}'::jsonb,
    request_headers,
    5000
  ) INTO req_id;

  -- Log success
  INSERT INTO public.webhook_logs (status, error_message, payload)
  VALUES ('SCHEDULED', 'Request successfully queued with ID: ' || req_id::text, request_body);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the exact error message to our diagnostic table
    INSERT INTO public.webhook_logs (status, error_message, payload)
    VALUES ('ERROR', SQLERRM, jsonb_build_object('error_state', SQLSTATE, 'error_msg', SQLERRM));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the Database Trigger on public.blogs
CREATE TRIGGER on_blog_inserted
  AFTER INSERT ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.tr_on_blog_inserted();

COMMENT ON FUNCTION public.tr_on_blog_inserted() IS 'Invokes the send-blog-notification Edge Function with error logging.';
