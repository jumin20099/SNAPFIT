-- Adds report category and target_user_id columns to reports table
ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS category VARCHAR(32) DEFAULT 'OTHER';

ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS target_user_id UUID NULL;

UPDATE reports
SET category = 'OTHER'
WHERE category IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_target_user ON reports(target_user_id, created_at DESC);
