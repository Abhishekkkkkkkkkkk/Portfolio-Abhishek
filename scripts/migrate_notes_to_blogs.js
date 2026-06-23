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

console.log('Connecting to:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

function determineCategories(note) {
  const title = (note.title || '').toLowerCase();
  const subject = (note.subject || '').toLowerCase().trim();

  // Rules based categorization
  if (subject === 'java' || subject === 'oops') {
    if (title.includes('oops') || title.includes('object') || subject === 'oops') {
      return ['Java', 'OOPs', 'Notes'];
    }
    if (title.includes('collection') || title.includes('list') || title.includes('map')) {
      return ['Java', 'Collections', 'Notes'];
    }
    if (title.includes('exception') || title.includes('error')) {
      return ['Java', 'Exception Handling', 'Notes'];
    }
    if (title.includes('thread') || title.includes('concurrency') || title.includes('multithreading')) {
      return ['Java', 'Multithreading', 'Notes'];
    }
    return ['Java', 'General', 'Notes'];
  }

  if (subject === 'dsa' || subject === 'recursion' || subject === 'dp' || subject === 'graph' || subject === 'algorithms') {
    if (subject === 'recursion' || title.includes('recursion')) {
      return ['DSA', 'Recursion', 'Notes'];
    }
    if (subject === 'dp' || title.includes('dp') || title.includes('dynamic programming')) {
      return ['DSA', 'Dynamic Programming', 'Notes'];
    }
    if (subject === 'graph' || title.includes('graph')) {
      return ['DSA', 'Graph', 'Notes'];
    }
    return ['DSA', 'General', 'Notes'];
  }

  if (subject === 'spring' || subject === 'spring boot') {
    return ['Backend', 'Spring Boot', 'Notes'];
  }

  if (subject === 'react') {
    return ['Frontend', 'React', 'Notes'];
  }

  if (subject === 'javascript' || subject === 'js') {
    return ['Frontend', 'JavaScript', 'Notes'];
  }

  if (subject === 'mongodb' || subject === 'mysql' || subject === 'sql' || subject === 'database') {
    if (subject === 'mysql' || title.includes('mysql') || title.includes('sql')) {
      return ['Database', 'MySQL', 'Notes'];
    }
    return ['Database', 'MongoDB', 'Notes'];
  }

  // Fallback
  return ['General', subject || 'Notes', 'Notes'];
}

async function main() {
  console.log('Fetching existing notes...');
  const { data: notes, error: fetchErr } = await supabase
    .from('notes')
    .select('*');

  if (fetchErr) {
    console.error('Error fetching notes:', fetchErr);
    return;
  }

  console.log(`Found ${notes.length} notes to migrate.`);

  for (const note of notes) {
    const categories = determineCategories(note);
    const slug = (note.title || 'note')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const uniqueSlug = `${slug}-${note.id.substring(0, 5).toLowerCase()}`;
    const readTime = note.page_count ? `${note.page_count} pages` : '5 min read';

    const blogContent = `
      <h3>${note.title}</h3>
      <p>${note.description || 'Study notes.'}</p>
      <div style="margin-top: 20px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12);">
        <iframe src="${note.pdf_url}" width="100%" height="800px" style="border: none;"></iframe>
      </div>
    `.trim();

    const blogRow = {
      id: `migrated-note-${note.id}`,
      slug: uniqueSlug,
      title: note.title,
      description: note.description || 'Study notes for ' + note.subject,
      content: blogContent,
      cover_emoji: note.cover_emoji || '📚',
      cover_img_url: null,
      categories: categories,
      tags: note.tags || [note.subject],
      featured: note.featured || false,
      read_time: readTime,
      published_date: note.created_at || new Date().toISOString(),
      updated_at: note.updated_at || new Date().toISOString(),
      pdf_url: note.pdf_url,
      page_count: note.page_count || 0,
      content_type: 'note'
    };

    console.log(`Migrating "${note.title}" -> Blogs category ${JSON.stringify(categories)}`);

    const { error: insertErr } = await supabase
      .from('blogs')
      .upsert(blogRow, { onConflict: 'id' });

    if (insertErr) {
      console.error(`Failed to migrate "${note.title}":`, insertErr);
    } else {
      console.log(`Successfully migrated "${note.title}"!`);
    }
  }

  console.log('Migration finished.');
}

main().catch(console.error);
