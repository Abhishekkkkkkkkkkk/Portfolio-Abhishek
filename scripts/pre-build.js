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
  
  // Helper to walk directories recursively
  function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (file === '.git') continue; // Skip Git configuration folder
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(filePath));
      } else if (file.endsWith('.md')) {
        results.push(filePath);
      }
    }
    return results;
  }

  const allMarkdownFiles = walk(contentDir);
  
  for (const filePath of allMarkdownFiles) {
    const relativePath = path.relative(contentDir, filePath);
    const segments = relativePath.split(path.sep);
    
    if (segments.length < 2) continue; // Must be inside at least a topic folder (e.g. dsa/something.md)
    
    const topic = segments[0];
    const file = segments[segments.length - 1];
    
    // Ensure public topic directory exists
    const publicTopicDir = path.join(publicOutDir, topic);
    if (!fs.existsSync(publicTopicDir)) {
      fs.mkdirSync(publicTopicDir, { recursive: true });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { metadata } = parseFrontmatter(fileContent);
    
    if (!metadata.id) {
      console.warn(`Warning: Skipping ${file} due to missing id in frontmatter.`);
      continue;
    }
    
    // Auto-populate missing details
    const slug = metadata.slug || metadata.id;
    
    // Determine category and subCategory fallback from folder structure
    const folderSubCategory = segments.length > 2 ? segments[1] : null;
    const cat = metadata.category || topic.charAt(0).toUpperCase() + topic.slice(1);
    const subCat = metadata.subCategory || folderSubCategory || "General";
    
    // Format categories array: [Category, SubCategory]
    let categories = metadata.categories || [cat, subCat];
    if (Array.isArray(categories) && categories.length === 1) {
      categories = [categories[0], subCat];
    }
    
    const blogMeta = {
      category: cat,
      subCategory: subCat,
      ...metadata,
      categories,
      slug,
      topicId: topic
    };
    
    blogsIndex.push(blogMeta);
    
    // Copy the markdown file directly to public output (flattened under the topic directory)
    const destPath = path.join(publicTopicDir, `${slug}.md`);
    fs.writeFileSync(destPath, fileContent, 'utf8');
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
