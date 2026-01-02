-- Tilt Database Schema
-- This migration creates all tables needed for the Tilt application
-- Uses Supabase Auth for user authentication (auth.users managed by Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- Enums
-- ================================

CREATE TYPE block_type AS ENUM ('markdown', 'video', 'image');
CREATE TYPE effect AS ENUM ('none', 'jitter', 'confetti');
CREATE TYPE reaction AS ENUM ('like', 'dislike');
CREATE TYPE share_status AS ENUM ('solved_fast', 'solved', 'gave_up', 'unsolved');

-- ================================
-- Profiles Table (linked to Supabase auth.users)
-- ================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on role for admin queries
CREATE INDEX profiles_role_idx ON profiles(role);

-- ================================
-- Problems Table
-- ================================

CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  question_blocks TEXT NOT NULL, -- JSON array of blocks
  answer_blocks TEXT NOT NULL, -- JSON array of blocks
  background_video_url TEXT,
  background_music_url TEXT,
  effect effect DEFAULT 'none',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create index on published status for feed queries
CREATE INDEX problems_published_idx ON problems(is_published) WHERE is_published = TRUE;

-- ================================
-- User Problem Interactions Table
-- ================================

CREATE TABLE user_problem_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visible_id TEXT NOT NULL UNIQUE, -- Unique share ID
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  reaction reaction,
  solved BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  solved_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0
);

-- Create indexes for efficient queries
CREATE INDEX interactions_user_idx ON user_problem_interactions(user_id);
CREATE INDEX interactions_problem_idx ON user_problem_interactions(problem_id);
CREATE INDEX interactions_solved_idx ON user_problem_interactions(user_id, solved) WHERE solved = TRUE;

-- ================================
-- Daily Stats Table
-- ================================

CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  problems_solved INTEGER NOT NULL DEFAULT 0,
  problems_attempted INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

-- Create index for leaderboard queries
CREATE INDEX daily_stats_user_date_idx ON daily_stats(user_id, date);

-- ================================
-- Shares Table
-- ================================

CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_code TEXT NOT NULL UNIQUE,
  interaction_id UUID NOT NULL REFERENCES user_problem_interactions(id) ON DELETE CASCADE,
  status share_status NOT NULL,
  share_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ================================
-- Media Files Table (for cleanup tracking)
-- ================================

CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
  file_type TEXT NOT NULL, -- 'video' | 'audio' | 'image'
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for orphan cleanup queries
CREATE INDEX media_files_orphan_idx ON media_files(problem_id) WHERE problem_id IS NULL;

-- ================================
-- Bookmarks Table (Future: remind-me-later feature)
-- ================================

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  note_content TEXT,
  note_type TEXT, -- 'problem' | 'note' | 'pdf' | etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  remind_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX bookmarks_user_idx ON bookmarks(user_id);

-- ================================
-- Trigger: Auto-create profile on new user signup
-- ================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- RLS Policies
-- ================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_problem_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update own profile
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Problems: Published problems readable by all, admins can manage all
CREATE POLICY "Published problems are viewable by everyone" ON problems 
  FOR SELECT USING (is_published = TRUE OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can insert problems" ON problems 
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update problems" ON problems 
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can delete problems" ON problems 
  FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Interactions: Users can manage own interactions
CREATE POLICY "Users can view own interactions" ON user_problem_interactions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own interactions" ON user_problem_interactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interactions" ON user_problem_interactions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily Stats: Users can manage own stats
CREATE POLICY "Users can view own stats" ON daily_stats 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own stats" ON daily_stats 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON daily_stats 
  FOR UPDATE USING (auth.uid() = user_id);

-- Shares: Anyone can view shares (for OG previews), users can create own
CREATE POLICY "Shares are viewable by everyone" ON shares FOR SELECT USING (true);
CREATE POLICY "Users can create shares" ON shares 
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_problem_interactions WHERE id = interaction_id
    )
  );

-- Bookmarks: Users can manage own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON bookmarks 
  FOR ALL USING (auth.uid() = user_id);

-- Media Files: Admins can manage all
CREATE POLICY "Admins can manage media files" ON media_files 
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
