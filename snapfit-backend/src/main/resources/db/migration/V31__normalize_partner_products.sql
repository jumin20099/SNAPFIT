-- V26__normalize_partner_products.sql
-- partner_products 테이블 정규화 - 수정 요청 데이터를 별도 테이블로 분리

-- 1. 수정 요청 테이블 생성
CREATE TABLE IF NOT EXISTS product_update_requests (
    id BIGSERIAL PRIMARY KEY,
    partner_product_id BIGINT NOT NULL,
    original_product_name VARCHAR(255),
    original_product_content TEXT,
    original_product_image TEXT,
    original_product_link VARCHAR(500),
    original_gender_category VARCHAR(50),
    original_major_category VARCHAR(100),
    original_sub_category VARCHAR(100),
    original_product_price INTEGER,
    requested_product_name VARCHAR(255),
    requested_product_content TEXT,
    requested_product_image TEXT,
    requested_product_link VARCHAR(500),
    requested_gender_category VARCHAR(50),
    requested_major_category VARCHAR(100),
    requested_sub_category VARCHAR(100),
    requested_product_price INTEGER,
    update_request_reason TEXT,
    update_request_status VARCHAR(20) DEFAULT 'PENDING_UPDATE',
    update_request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
      CONSTRAINT fk_update_requests_partner_product 
          FOREIGN KEY (partner_product_id) REFERENCES partner_products(partner_product_idx) ON DELETE CASCADE
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_update_requests_partner_product_id ON product_update_requests(partner_product_id);
CREATE INDEX IF NOT EXISTS idx_update_requests_status ON product_update_requests(update_request_status);
CREATE INDEX IF NOT EXISTS idx_update_requests_date ON product_update_requests(update_request_date);

-- 3. 기존 수정 요청 데이터를 새 테이블로 이관
INSERT INTO product_update_requests (
    partner_product_id,
    original_product_name,
    original_product_content,
    original_product_image,
    original_product_link,
    original_gender_category,
    original_major_category,
    original_sub_category,
    original_product_price,
    requested_product_name,
    requested_product_content,
    requested_product_image,
    requested_product_link,
    requested_gender_category,
    requested_major_category,
    requested_sub_category,
    requested_product_price,
    update_request_reason,
    update_request_status,
    update_request_date,
    rejection_reason,
    created_at,
    updated_at
)
SELECT 
    partner_product_idx as partner_product_id,
    original_product_name,
    original_product_content,
    original_product_image,
    original_product_link,
    original_gender_category,
    original_major_category,
    original_sub_category,
    original_product_price,
    requested_product_name,
    requested_product_content,
    requested_product_image,
    requested_product_link,
    requested_gender_category,
    requested_major_category,
    requested_sub_category,
    requested_product_price,
    update_request_reason,
    update_request_status,
    update_request_date,
    rejection_reason,
    created_at,
    updated_at
FROM partner_products 
WHERE update_request_status != 'NO_UPDATE' 
   OR original_product_name IS NOT NULL 
   OR requested_product_name IS NOT NULL;

-- 4. partner_products 테이블에서 수정 요청 관련 컬럼들 제거
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

-- 5. partner_products 테이블에 수정 요청 상태 컬럼 추가 (간단한 참조용)
ALTER TABLE partner_products ADD COLUMN IF NOT EXISTS has_pending_update_request BOOLEAN DEFAULT FALSE;

-- 6. 수정 요청이 있는 상품들에 대해 플래그 업데이트
UPDATE partner_products 
SET has_pending_update_request = TRUE 
WHERE partner_product_idx IN (
    SELECT DISTINCT partner_product_id 
    FROM product_update_requests 
    WHERE update_request_status = 'PENDING_UPDATE'
);
