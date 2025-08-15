-- V3.5__create_partner_products.sql
-- 제휴사 상품(partner_products) 테이블 생성

CREATE TABLE IF NOT EXISTS partner_products (
    partner_product_idx SERIAL PRIMARY KEY,
    store_idx INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_content TEXT,
    product_price INTEGER NOT NULL,
    product_image TEXT,
    product_link VARCHAR(500),
    gender_category VARCHAR(20),
    major_category VARCHAR(50),
    sub_category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 외래키 제약조건 추가
ALTER TABLE partner_products
    ADD CONSTRAINT fk_partner_products_stores FOREIGN KEY (store_idx) REFERENCES stores(store_idx);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_partner_products_store_idx ON partner_products(store_idx);
CREATE INDEX IF NOT EXISTS idx_partner_products_approved ON partner_products(is_approved);
CREATE INDEX IF NOT EXISTS idx_partner_products_active ON partner_products(is_active);
