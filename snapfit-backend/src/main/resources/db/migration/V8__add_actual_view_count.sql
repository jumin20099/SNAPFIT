-- 실제 조회수(12시간 중복 방지) 카운터 컬럼 추가
ALTER TABLE products
ADD COLUMN IF NOT EXISTS actual_view_count BIGINT DEFAULT 0;

