-- V22__add_missing_columns.sql
-- 누락된 컬럼들을 추가하는 마이그레이션

-- reports 테이블에 updated_at 컬럼 추가
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- updated_at 컬럼에 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports (updated_at);

-- 기존 레코드들의 updated_at을 created_at과 동일하게 설정
UPDATE reports 
SET updated_at = created_at 
WHERE updated_at IS NULL;
