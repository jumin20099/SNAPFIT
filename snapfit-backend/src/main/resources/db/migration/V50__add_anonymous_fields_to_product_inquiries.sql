-- 상품 문의 테이블에 익명 관련 컬럼 추가
ALTER TABLE product_inquiries ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE product_inquiries ADD COLUMN anonymous_index INT;
ALTER TABLE product_inquiries ADD COLUMN anonymous_password_hash VARCHAR(255);
