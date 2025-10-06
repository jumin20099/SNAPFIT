-- 상품 후기 테이블에 익명 관련 컬럼 추가
ALTER TABLE product_reviews ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE product_reviews ADD COLUMN anonymous_index INT;
ALTER TABLE product_reviews ADD COLUMN anonymous_password_hash VARCHAR(255);
