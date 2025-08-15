-- V12__cleanup_partner_products.sql
-- partner_products 테이블에서 수정 요청 관련 불필요한 컬럼들 제거

-- 수정 요청 관련 컬럼들 제거
ALTER TABLE partner_products DROP COLUMN IF EXISTS original_product_name;
ALTER TABLE partner_products DROP COLUMN IF EXISTS original_product_content;
ALTER TABLE partner_products DROP COLUMN IF EXISTS original_product_image;
ALTER TABLE partner_products DROP COLUMN IF EXISTS original_product_link;
ALTER TABLE partner_products DROP COLUMN IF EXISTS original_gender_category;
ALTER TABLE partner_products DROP COLUMN IF EXISTS original_major_category;
ALTER TABLE partner_products DROP COLUMN IF EXISTS original_sub_category;
ALTER TABLE partner_products DROP COLUMN IF EXISTS original_product_price;

ALTER TABLE partner_products DROP COLUMN IF EXISTS requested_product_name;
ALTER TABLE partner_products DROP COLUMN IF EXISTS requested_product_content;
ALTER TABLE partner_products DROP COLUMN IF EXISTS requested_product_image;
ALTER TABLE partner_products DROP COLUMN IF EXISTS requested_product_link;
ALTER TABLE partner_products DROP COLUMN IF EXISTS requested_gender_category;
ALTER TABLE partner_products DROP COLUMN IF EXISTS requested_major_category;
ALTER TABLE partner_products DROP COLUMN IF EXISTS requested_sub_category;
ALTER TABLE partner_products DROP COLUMN IF EXISTS requested_product_price;

ALTER TABLE partner_products DROP COLUMN IF EXISTS update_request_status;
ALTER TABLE partner_products DROP COLUMN IF EXISTS update_request_reason;
ALTER TABLE partner_products DROP COLUMN IF EXISTS update_request_date;
