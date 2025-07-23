-- V3__split_product_category.sql
-- products 테이블에 major_category, sub_category 컬럼 추가
-- 기존 product_category 값을 major_category 로 이동

ALTER TABLE products
    ADD COLUMN major_category VARCHAR(50);

ALTER TABLE products
    ADD COLUMN sub_category VARCHAR(100);

-- 기존 데이터 이관 (sub_category 는 NULL 유지)
UPDATE products
   SET major_category = product_category
 WHERE product_category IS NOT NULL;

-- 추후 애플리케이션 코드 정비 후 product_category 컬럼 제거 예정 