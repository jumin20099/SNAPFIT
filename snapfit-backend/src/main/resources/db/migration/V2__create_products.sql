-- 상품(products) 테이블 생성
CREATE TABLE IF NOT EXISTS products (
    product_idx SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_content TEXT,
    product_price INTEGER NOT NULL,
    product_image TEXT,
    major_category VARCHAR(100),
    sub_category VARCHAR(100),
    store_idx INTEGER,
    view_count BIGINT DEFAULT 0,
    actual_view_count BIGINT DEFAULT 0,
    is_new_product BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 외래키 제약조건 추가
ALTER TABLE products
    ADD CONSTRAINT fk_products_stores FOREIGN KEY (store_idx) REFERENCES stores(store_idx);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_major_category ON products(major_category);
CREATE INDEX IF NOT EXISTS idx_products_sub_category ON products(sub_category);
CREATE INDEX IF NOT EXISTS idx_products_store_idx ON products(store_idx);
CREATE INDEX IF NOT EXISTS idx_products_approved ON products(is_approved);
