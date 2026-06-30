import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read env variables manually
const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- Blogs Schema Sample ---');
  const { data: blogs, error: bErr } = await supabase.from('blogs').select('*').limit(1);
  if (bErr) console.error(bErr);
  else console.log(blogs[0] ? Object.keys(blogs[0]) : 'No blogs');

  console.log('--- Projects Schema Sample ---');
  const { data: projects, error: pErr } = await supabase.from('projects').select('*').limit(1);
  if (pErr) console.error(pErr);
  else console.log(projects[0] ? Object.keys(projects[0]) : 'No projects');
}

main().catch(console.error);
