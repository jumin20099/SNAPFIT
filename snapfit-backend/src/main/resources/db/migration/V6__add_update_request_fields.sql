-- V5__add_update_request_fields.sql (멱등적 버전)
-- 수정 요청 관련 필드들 추가

-- 원본 데이터 필드들
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS original_product_name VARCHAR(255);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS original_product_content TEXT;
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS original_product_image VARCHAR(500);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS original_product_link VARCHAR(500);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS original_gender_category VARCHAR(20);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS original_major_category VARCHAR(50);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS original_sub_category VARCHAR(50);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS original_product_price INTEGER;

-- 수정 요청 상태 필드들
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS update_request_status VARCHAR(20) DEFAULT 'NO_UPDATE';
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS update_request_reason TEXT;
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS update_request_date TIMESTAMP;

-- 요청된 데이터 필드들
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS requested_product_name VARCHAR(255);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS requested_product_content TEXT;
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS requested_product_image VARCHAR(500);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS requested_product_link VARCHAR(500);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS requested_gender_category VARCHAR(20);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS requested_major_category VARCHAR(50);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS requested_sub_category VARCHAR(50);
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS requested_product_price INTEGER; 