-- =============================================
-- Birthday Card Automation System – DB Schema
-- FPT Telecom Internal Tools Team – 04/2026
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: tags
-- =============================================
CREATE TABLE IF NOT EXISTS tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(60) NOT NULL UNIQUE,
  color       VARCHAR(7),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Table: templates
-- =============================================
CREATE TABLE IF NOT EXISTS templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(120) NOT NULL,
  description     TEXT,
  canvas_json     JSONB NOT NULL,
  html_snapshot   TEXT,
  thumbnail_url   VARCHAR(512),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Table: template_tags (N-N relationship)
-- =============================================
CREATE TABLE IF NOT EXISTS template_tags (
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, tag_id)
);

-- =============================================
-- Table: render_logs
-- =============================================
CREATE TABLE IF NOT EXISTS render_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id   UUID REFERENCES templates(id) ON DELETE SET NULL,
  employee_name VARCHAR(120),
  payload       JSONB,
  duration_ms   INTEGER,
  status        VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error')),
  error_msg     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_tags_tag_id ON template_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_render_logs_template_id ON render_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_render_logs_status ON render_logs(status);
CREATE INDEX IF NOT EXISTS idx_render_logs_created_at ON render_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- =============================================
-- Seed: default tag
-- =============================================
INSERT INTO tags (name, color, description)
VALUES ('fpt-telecom-birthday', '#185FA5', 'Thiệp sinh nhật FPT Telecom')
ON CONFLICT (name) DO NOTHING;
