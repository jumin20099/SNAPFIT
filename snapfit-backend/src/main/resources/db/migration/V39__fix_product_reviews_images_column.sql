-- images 컬럼을 JSONB에서 TEXT로 변경
ALTER TABLE product_reviews 
ALTER COLUMN images TYPE TEXT;

-- 기존 JSONB 데이터를 TEXT로 변환 (필요한 경우)
-- UPDATE product_reviews 
-- SET images = images::TEXT 
-- WHERE images IS NOT NULL;
