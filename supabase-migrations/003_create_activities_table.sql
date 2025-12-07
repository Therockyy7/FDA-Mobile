/*
 * Migration: 003_create_activities_table
 * Description: Tạo bảng activities để track hoạt động note-related
 * Dependencies: auth.users (Supabase built-in)
 * Author: Generated
 * Date: 2025-01-26
 */

-- Create activities table for tracking note-related actions
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('note_created', 'note_updated', 'note_deleted', 'note_shared', 'user_action')),
  icon TEXT DEFAULT 'file-text',
  icon_color TEXT DEFAULT 'bg-blue-500',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  related_id UUID -- Can reference notes
);

-- Create RLS policies for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_activities_user_id_created_at ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities(type);