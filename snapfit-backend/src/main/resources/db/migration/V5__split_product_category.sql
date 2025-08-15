-- V4__split_product_category.sql (멱등적 버전)
-- products 테이블에 major_category, sub_category 컬럼 추가
-- 기존 product_category 값을 major_category 로 이동

-- 1) 컬럼이 없으면 추가 (IF NOT EXISTS 사용)
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS major_category VARCHAR(50);

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100);

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS gender_category VARCHAR(20);

-- 2) 기존 데이터 이관 (major_category가 비어있을 때만)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'products'
        AND column_name = 'product_category'
  ) THEN
    UPDATE products
       SET major_category = COALESCE(major_category, product_category)
     WHERE major_category IS NULL;
  END IF;
END $$;

-- 3) partner_products 테이블에도 안전하게 컬럼 추가
ALTER TABLE partner_products 
    ADD COLUMN IF NOT EXISTS gender_category VARCHAR(20);

ALTER TABLE partner_products 
    ADD COLUMN IF NOT EXISTS major_category VARCHAR(50);

ALTER TABLE partner_products 
    ADD COLUMN IF NOT EXISTS sub_category VARCHAR(50);

-- 4) 인덱스도 중복생성 방지
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
     WHERE schemaname='public' AND indexname='idx_products_major_sub'
  ) THEN
    CREATE INDEX idx_products_major_sub ON products (major_category, sub_category);
  END IF;
END $$; 