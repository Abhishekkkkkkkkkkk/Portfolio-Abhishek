import { createClient } from "@supabase/supabase-js";

// Load environment variables with local run defaults to prevent crash if not configured yet
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://llheaxpkvffcalicxkvk.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaGVheHBrdmZmY2FsaWN4a3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTM0NTUsImV4cCI6MjA5NTk2OTQ1NX0.3HC30_ApQRGw-TWJ7aLQywMB2YBSY9y4nWn0g8PhAPI";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.info("Using built-in live Supabase defaults.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
