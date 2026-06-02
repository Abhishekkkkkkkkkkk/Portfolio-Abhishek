-- Supabase SQL DDL Schema Setup Script
-- Paste this script inside your Supabase Project SQL Editor and run it to set up all tables.

-- Enable fuzzy matching extension for Search functionality
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(255) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  img_url VARCHAR(512) NOT NULL,
  demo_url VARCHAR(512),
  github_url VARCHAR(512), -- Can be "Private" or a GitHub link
  tech_stack VARCHAR(50)[] NOT NULL,
  features TEXT[] NOT NULL,
  case_study TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  credential_url VARCHAR(512),
  img_url VARCHAR(512) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BLOGS TABLE (Knowledge Hub)
CREATE TABLE IF NOT EXISTS blogs (
  id VARCHAR(255) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL, -- Rich-text / Markdown content
  cover_emoji VARCHAR(10), -- e.g. "☕" or "👾"
  cover_img_url VARCHAR(512),
  categories VARCHAR(50)[] NOT NULL,
  tags VARCHAR(50)[] NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  read_time VARCHAR(50), -- e.g. "6 min read"
  published_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0
);

-- 4. TECHNICAL NOTES TABLE
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  subject VARCHAR(100) NOT NULL, -- e.g. "Java", "Spring Boot", "DSA"
  tags VARCHAR(50)[] NOT NULL,
  pdf_url VARCHAR(512) NOT NULL, -- Google Drive / Supabase storage link
  cover_emoji VARCHAR(10),
  page_count INTEGER,
  publish_date VARCHAR(50), -- e.g. "March 2026"
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INDEXES FOR FAST SCALING & QUERIES
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured) WHERE featured = TRUE;

-- Trigram indexing for full-text search capabilities across title, description, and content
CREATE INDEX IF NOT EXISTS idx_blogs_search ON blogs USING gin (title gin_trgm_ops, description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING gin (title gin_trgm_ops, description gin_trgm_ops);

-- 5. FUNCTION TO INCREMENT BLOG VIEWS IN REAL-TIME (Row-level atomic operation)
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id VARCHAR(255))
RETURNS VOID AS $$
BEGIN
  UPDATE blogs
  SET views_count = views_count + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCTION TO INCREMENT BLOG LIKES
CREATE OR REPLACE FUNCTION increment_blog_likes(blog_id VARCHAR(255))
RETURNS INT AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE blogs
  SET likes_count = likes_count + 1
  WHERE id = blog_id
  RETURNING likes_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 8. CREATE POLICIES FOR ANONYMOUS SELECT ACCESS (PUBLIC READ)
CREATE POLICY "Enable read access for all users" ON projects FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON certificates FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON blogs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON notes FOR SELECT USING (true);

-- 9. SUBSCRIBERS TABLE (Newsletter subscriptions)
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert access for all users" ON subscribers FOR INSERT WITH CHECK (true);

-- 10. ENABLE REALTIME REPLICATION
-- Paste and run the following command in your Supabase SQL editor to ensure updates stream live:
-- ALTER PUBLICATION supabase_realtime ADD TABLE blogs;
-- ALTER TABLE blogs REPLICA IDENTITY FULL;
