-- 수정 요청 관련 필드들 추가
ALTER TABLE partner_products ADD COLUMN original_product_name VARCHAR(255);
ALTER TABLE partner_products ADD COLUMN original_product_content TEXT;
ALTER TABLE partner_products ADD COLUMN original_product_image VARCHAR(500);
ALTER TABLE partner_products ADD COLUMN original_product_link VARCHAR(500);
ALTER TABLE partner_products ADD COLUMN original_gender_category VARCHAR(20);
ALTER TABLE partner_products ADD COLUMN original_major_category VARCHAR(50);
ALTER TABLE partner_products ADD COLUMN original_sub_category VARCHAR(50);
ALTER TABLE partner_products ADD COLUMN original_product_price INTEGER;
ALTER TABLE partner_products ADD COLUMN update_request_status VARCHAR(20) DEFAULT 'NO_UPDATE';
ALTER TABLE partner_products ADD COLUMN update_request_reason TEXT;
ALTER TABLE partner_products ADD COLUMN update_request_date TIMESTAMP;

-- 수정 요청 데이터 필드들 추가
ALTER TABLE partner_products ADD COLUMN requested_product_name VARCHAR(255);
ALTER TABLE partner_products ADD COLUMN requested_product_content TEXT;
ALTER TABLE partner_products ADD COLUMN requested_product_image VARCHAR(500);
ALTER TABLE partner_products ADD COLUMN requested_product_link VARCHAR(500);
ALTER TABLE partner_products ADD COLUMN requested_gender_category VARCHAR(20);
ALTER TABLE partner_products ADD COLUMN requested_major_category VARCHAR(50);
ALTER TABLE partner_products ADD COLUMN requested_sub_category VARCHAR(50);
ALTER TABLE partner_products ADD COLUMN requested_product_price INTEGER; 