-- V13__add_update_request_fields.sql
-- partner_products 테이블에 수정 요청 관련 필드들 추가

-- 수정 요청 관련 컬럼들 추가
DO $$
BEGIN
    -- original_* 컬럼들 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'original_product_name') THEN
        ALTER TABLE partner_products ADD COLUMN original_product_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'original_product_content') THEN
        ALTER TABLE partner_products ADD COLUMN original_product_content TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'original_product_image') THEN
        ALTER TABLE partner_products ADD COLUMN original_product_image TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'original_product_link') THEN
        ALTER TABLE partner_products ADD COLUMN original_product_link VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'original_gender_category') THEN
        ALTER TABLE partner_products ADD COLUMN original_gender_category VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'original_major_category') THEN
        ALTER TABLE partner_products ADD COLUMN original_major_category VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'original_sub_category') THEN
        ALTER TABLE partner_products ADD COLUMN original_sub_category VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'original_product_price') THEN
        ALTER TABLE partner_products ADD COLUMN original_product_price INTEGER;
    END IF;
    
    -- requested_* 컬럼들 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'requested_product_name') THEN
        ALTER TABLE partner_products ADD COLUMN requested_product_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'requested_product_content') THEN
        ALTER TABLE partner_products ADD COLUMN requested_product_content TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'requested_product_image') THEN
        ALTER TABLE partner_products ADD COLUMN requested_product_image TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'requested_product_link') THEN
        ALTER TABLE partner_products ADD COLUMN requested_product_link VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'requested_gender_category') THEN
        ALTER TABLE partner_products ADD COLUMN requested_gender_category VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'requested_major_category') THEN
        ALTER TABLE partner_products ADD COLUMN requested_major_category VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'requested_sub_category') THEN
        ALTER TABLE partner_products ADD COLUMN requested_sub_category VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'requested_product_price') THEN
        ALTER TABLE partner_products ADD COLUMN requested_product_price INTEGER;
    END IF;
    
    -- update_request_* 컬럼들 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'update_request_status') THEN
        ALTER TABLE partner_products ADD COLUMN update_request_status VARCHAR(20) DEFAULT 'NO_UPDATE';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'update_request_reason') THEN
        ALTER TABLE partner_products ADD COLUMN update_request_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_products' AND column_name = 'update_request_date') THEN
        ALTER TABLE partner_products ADD COLUMN update_request_date TIMESTAMP;
    END IF;
END $$;
