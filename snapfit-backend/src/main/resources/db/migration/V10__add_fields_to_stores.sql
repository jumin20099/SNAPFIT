-- V10__add_fields_to_stores.sql
-- stores 테이블에 필요한 필드들 추가

-- 각 컬럼을 개별적으로 추가 (PostgreSQL에서는 IF NOT EXISTS를 지원하지 않음)
DO $$
BEGIN
    -- store_link 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'store_link') THEN
        ALTER TABLE stores ADD COLUMN store_link VARCHAR(500);
    END IF;
    
    -- royalty_rate 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'royalty_rate') THEN
        ALTER TABLE stores ADD COLUMN royalty_rate FLOAT;
    END IF;
    
    -- contact 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'contact') THEN
        ALTER TABLE stores ADD COLUMN contact VARCHAR(255);
    END IF;
    
    -- is_active 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'is_active') THEN
        ALTER TABLE stores ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;
