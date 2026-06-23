-- SQL Schema Migrations: Enable Write/Admin Access Policies on Portfolio Tables
-- Run these queries inside the SQL Editor of your Supabase dashboard to allow the portfolio Admin Panel to insert, update, and delete entries.

-- =========================================================================
-- 1. Policies for "blogs"
-- =========================================================================
DROP POLICY IF EXISTS "Enable write/upsert access for all users" ON blogs;
DROP POLICY IF EXISTS "Enable delete access for all users" ON blogs;

CREATE POLICY "Enable write/upsert access for all users" ON blogs 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- =========================================================================
-- 2. Policies for "projects"
-- =========================================================================
DROP POLICY IF EXISTS "Enable write/upsert access for all users" ON projects;

CREATE POLICY "Enable write/upsert access for all users" ON projects 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- =========================================================================
-- 3. Policies for "certificates"
-- =========================================================================
DROP POLICY IF EXISTS "Enable write/upsert access for all users" ON certificates;

CREATE POLICY "Enable write/upsert access for all users" ON certificates 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- =========================================================================
-- 4. Policies for "interview_questions"
-- =========================================================================
DROP POLICY IF EXISTS "Enable write/upsert access for all users" ON interview_questions;

CREATE POLICY "Enable write/upsert access for all users" ON interview_questions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
