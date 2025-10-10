-- V54__make_report_reason_nullable.sql
-- 신고 사유(reason) 컬럼을 NULL 허용으로 변경

-- 기존 제약조건 제거
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reason_length_check;

-- reason 컬럼을 NULL 허용으로 변경
ALTER TABLE reports ALTER COLUMN reason DROP NOT NULL;

-- 새로운 제약조건 추가 (NULL이거나 1자 이상 100자 이하)
ALTER TABLE reports ADD CONSTRAINT reports_reason_length_check 
    CHECK (reason IS NULL OR (length(trim(reason)) > 0 AND length(reason) <= 100));

-- 기존 NOT NULL 제약조건도 제거
ALTER TABLE reports ALTER COLUMN reason DROP NOT NULL;
