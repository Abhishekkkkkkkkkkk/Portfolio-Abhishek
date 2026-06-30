-- Migration: Add references_links column to blogs table
-- Store as an array of strings in format "Label | URL" or "URL"
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS references_links TEXT[] DEFAULT '{}';
