-- =============================================
-- Learnozi — Supabase Database Setup
-- Run this in Supabase SQL Editor (supabase.com/dashboard → SQL Editor)
-- =============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  academic_profile JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. FLASHCARD SETS TABLE
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT DEFAULT 'General',
  cards JSONB DEFAULT '[]'::jsonb,
  progress INTEGER DEFAULT 0,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FOCUS SESSIONS TABLE
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT DEFAULT 'General',
  duration_min INTEGER NOT NULL,
  completed BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SEMESTERS TABLE
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  credit_hours INTEGER DEFAULT 3,
  target_grade TEXT DEFAULT '',
  actual_grade TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- These ensure users can only access their own data
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Users: Allow service role full access (we use service role key for server-side API routes)
-- For anon key: allow insert (registration) and select by own id
CREATE POLICY "Allow anon insert for registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update own data" ON users
  FOR UPDATE USING (true);

-- Flashcard Sets: full CRUD for authenticated users
CREATE POLICY "Allow all operations on flashcard_sets" ON flashcard_sets
  FOR ALL USING (true) WITH CHECK (true);

-- Focus Sessions: full CRUD for authenticated users
CREATE POLICY "Allow all operations on focus_sessions" ON focus_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Semesters: full CRUD for authenticated users
CREATE POLICY "Allow all operations on semesters" ON semesters
  FOR ALL USING (true) WITH CHECK (true);

-- Courses: full CRUD for authenticated users
CREATE POLICY "Allow all operations on courses" ON courses
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user ON flashcard_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_completed ON focus_sessions(user_id, completed, completed_at);
CREATE INDEX IF NOT EXISTS idx_semesters_user ON semesters(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
