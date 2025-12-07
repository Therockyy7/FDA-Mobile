/*
 * Migration: 004_add_categories_to_notes
 * Description: Thêm categories, tags, favorites và color vào bảng notes
 * Dependencies: 001_create_notes_table.sql
 * Author: Generated
 * Date: 2025-01-26
 */

-- Add categories and tags to notes table
ALTER TABLE notes ADD COLUMN category TEXT DEFAULT 'general';
ALTER TABLE notes ADD COLUMN tags TEXT[] DEFAULT '{}';
ALTER TABLE notes ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN color TEXT DEFAULT '#ffffff';

-- Create index for better search performance
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_is_favorite ON notes(is_favorite);
CREATE INDEX idx_notes_user_id_updated_at ON notes(user_id, updated_at DESC);