-- =============================================
-- Master PPT AI - Supabase PostgreSQL Migration
-- =============================================

CREATE TABLE IF NOT EXISTS ppt_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
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

CREATE TABLE IF NOT EXISTS master_histories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES ppt_users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES ppt_users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS slide_layouts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  draft_id TEXT REFERENCES drafts(id) ON DELETE CASCADE,
  slide_number INTEGER,
  slide_type TEXT,
  layout_name TEXT,
  placeholders TEXT,
  background TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_slide_layouts_draft_id ON slide_layouts(draft_id);
CREATE INDEX IF NOT EXISTS idx_master_histories_user_id ON master_histories(user_id);

ALTER TABLE ppt_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY ppt_users_all ON ppt_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY themes_all ON themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY master_histories_all ON master_histories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY drafts_all ON drafts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY slide_layouts_all ON slide_layouts FOR ALL USING (true) WITH CHECK (true);
