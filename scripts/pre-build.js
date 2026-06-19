import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;

function parseFrontmatter(fileContent) {
  const match = frontmatterRegex.exec(fileContent);
  if (!match) return { metadata: {}, content: fileContent };
  
  const metaText = match[1];
  const bodyText = match[2];
  const metadata = {};
  
  const lines = metaText.split('\n');
  let currentKey = null;
  
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    
    // Array item check
    if (line.startsWith('- ') && currentKey) {
      const val = line.substring(2).trim().replace(/^['"]|['"]$/g, '');
      if (Array.isArray(metadata[currentKey])) {
        metadata[currentKey].push(val);
      } else {
        metadata[currentKey] = [val];
      }
      continue;
    }
    
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    
    const key = line.substring(0, colonIdx).trim();
    const valStr = line.substring(colonIdx + 1).trim();
    
    if (valStr === '') {
      metadata[key] = [];
      currentKey = key;
    } else {
      currentKey = null;
      let val = valStr.replace(/^['"]|['"]$/g, '');
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (val === 'null' || val === 'NULL') val = null;
      else if (!isNaN(val) && val !== '') val = Number(val);
      
      metadata[key] = val;
    }
  }
  
  return { metadata, content: bodyText };
}

function compileBlogs() {
  const contentDir = './content/blogs';
  const dataOutDir = './src/data';
  const publicOutDir = './public/blogs';
  
  console.log('Starting pre-build blog content compilation...');
  
  // Fetch/Sync remote blogs from GitHub
  const repoUrl = "https://github.com/Abhishekkkkkkkkkkk/my-blogs.git";
  console.log(`Syncing blogs from remote repository: ${repoUrl}...`);
  try {
    if (fs.existsSync(contentDir)) {
      fs.rmSync(contentDir, { recursive: true, force: true });
    }
    execSync(`git clone --depth 1 ${repoUrl} ${contentDir}`, { stdio: 'inherit' });
    console.log("Remote blogs successfully synced!");
  } catch (error) {
    console.warn("Warning: Failed to clone remote blogs repository. Falling back to local cache if present.", error.message);
  }
  
  if (!fs.existsSync(contentDir)) {
    console.error(`Error: Content directory ${contentDir} does not exist.`);
    return;
  }
  
  // Ensure output directories exist
  if (!fs.existsSync(dataOutDir)) {
    fs.mkdirSync(dataOutDir, { recursive: true });
  }
  if (fs.existsSync(publicOutDir)) {
    fs.rmSync(publicOutDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicOutDir, { recursive: true });
  
  const blogsIndex = [];
  
  // Read all folders in content/blogs
  const topics = fs.readdirSync(contentDir).filter(f => fs.statSync(path.join(contentDir, f)).isDirectory());
  
  for (const topic of topics) {
    const topicPath = path.join(contentDir, topic);
    const files = fs.readdirSync(topicPath).filter(f => f.endsWith('.md'));
    
    const publicTopicDir = path.join(publicOutDir, topic);
    fs.mkdirSync(publicTopicDir, { recursive: true });
    
    for (const file of files) {
      const filePath = path.join(topicPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      const { metadata } = parseFrontmatter(fileContent);
      
      if (!metadata.id) {
        console.warn(`Warning: Skipping ${file} due to missing id in frontmatter.`);
        continue;
      }
      
      // Auto-populate missing details
      const slug = metadata.slug || metadata.id;
      
      // Add topic identifier for routing lookup
      const blogMeta = {
        ...metadata,
        slug,
        topicId: topic
      };
      
      blogsIndex.push(blogMeta);
      
      // Copy the markdown file directly to public output
      const destPath = path.join(publicTopicDir, file);
      fs.writeFileSync(destPath, fileContent, 'utf8');
    }
  }
  
  // Sort blogs: featured first, then publishedDate descending
  blogsIndex.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.publishedDate) - new Date(a.publishedDate);
  });
  
  // Write the compiled index JSON
  fs.writeFileSync(
    path.join(dataOutDir, 'blogs-index.json'),
    JSON.stringify(blogsIndex, null, 2),
    'utf8'
  );
  
  console.log(`Successfully compiled index and copied ${blogsIndex.length} blogs.`);
}

compileBlogs();
