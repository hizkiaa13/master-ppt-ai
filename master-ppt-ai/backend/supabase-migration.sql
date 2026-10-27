-- =============================================
-- Master PPT AI - Supabase PostgreSQL Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Themes Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  font_heading TEXT,
  font_body TEXT,
  color_primary TEXT,
  color_secondary TEXT,
  color_accent TEXT,
  layout_templates TEXT,
  category TEXT,
  preview_image TEXT,
  custom_title TEXT,
  custom_description TEXT,
  slide_count INTEGER DEFAULT 5,
  custom_colors TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Master Histories Table ──────────────────────────────
CREATE TABLE IF NOT EXISTS master_histories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL REFERENCES themes(id),
  theme_name TEXT,
  custom_fonts TEXT,
  custom_colors TEXT,
  custom_layouts TEXT,
  slide_previews TEXT,
  edited_slides TEXT,
  final_pptx_path TEXT,
  pptx_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Drafts Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_id TEXT,
  custom_title TEXT,
  custom_description TEXT,
  slide_count INTEGER DEFAULT 5,
  custom_colors TEXT,
  current_step INTEGER DEFAULT 1,
  form_data TEXT,
  generated_slides TEXT,
  edited_slides TEXT,
  recommendations TEXT,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Slide Layouts Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS slide_layouts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  draft_id TEXT REFERENCES drafts(id) ON DELETE CASCADE,
  slide_number INTEGER,
  slide_type TEXT,
  layout_name TEXT,
  placeholders TEXT,
  background TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_slide_layouts_draft_id ON slide_layouts(draft_id);
CREATE INDEX IF NOT EXISTS idx_master_histories_user_id ON master_histories(user_id);

-- ─── Row Level Security ──────────────────────────────────
-- Disable RLS for service role access (backend uses service role key)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide_layouts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (bypass RLS)
CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on themes" ON themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on master_histories" ON master_histories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on drafts" ON drafts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on slide_layouts" ON slide_layouts FOR ALL USING (true) WITH CHECK (true);
