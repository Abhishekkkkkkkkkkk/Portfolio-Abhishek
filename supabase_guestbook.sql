-- 1. Create guestbook table if not exists
CREATE TABLE IF NOT EXISTS public.guestbook (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message VARCHAR(500) NOT NULL,
  emoji VARCHAR(10) DEFAULT '💻',
  country_code VARCHAR(10) DEFAULT 'UN',
  country_name VARCHAR(100) DEFAULT 'Unknown Location',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone to select signatures
CREATE POLICY "Enable read access for all users" 
ON public.guestbook FOR SELECT 
USING (true);

-- Allow anyone to insert new signatures
CREATE POLICY "Enable insert access for all users" 
ON public.guestbook FOR INSERT 
WITH CHECK (true);

-- 4. Enable Realtime Replication for the Guestbook Table
-- Check if publication exists, add the table to the replication set
BEGIN;
  -- Add table to publication if publication exists
  ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback/Create publication if it doesn't exist
    CREATE PUBLICATION supabase_realtime FOR TABLE public.guestbook;
END;

ALTER TABLE public.guestbook REPLICA IDENTITY FULL;
