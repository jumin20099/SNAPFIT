-- 사이즈 시스템 테이블 생성
-- V41: 사이즈 변형, 재고, 사이즈 차트 테이블

-- 사이즈 변형 테이블 (상품별 사이즈 옵션)
CREATE TABLE size_variants (
    size_variant_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(product_idx) ON DELETE CASCADE,
    size_label VARCHAR(20) NOT NULL, -- S, M, L, 28, 30, 32 등
    size_value VARCHAR(50), -- 실제 사이즈 값 (예: "Small", "28인치")
    sku VARCHAR(100) UNIQUE, -- SKU 코드
    additional_price INTEGER DEFAULT 0, -- 사이즈별 추가 가격 (원)
    is_active BOOLEAN DEFAULT true, -- 활성화 여부
    sort_order INTEGER DEFAULT 0, -- 정렬 순서
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 재고 테이블
CREATE TABLE inventories (
    inventory_id BIGSERIAL PRIMARY KEY,
    size_variant_id BIGINT NOT NULL REFERENCES size_variants(size_variant_id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL DEFAULT 0, -- 현재 재고
    safety_stock INTEGER DEFAULT 0, -- 안전 재고
    reserved_quantity INTEGER DEFAULT 0, -- 예약된 재고 (주문 대기 중)
    last_restocked_at TIMESTAMP, -- 마지막 입고일
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_stock CHECK (stock_quantity >= 0),
    CONSTRAINT positive_safety_stock CHECK (safety_stock >= 0),
    CONSTRAINT positive_reserved CHECK (reserved_quantity >= 0)
);

-- 사이즈 차트 테이블 (브랜드/카테고리별 사이즈 가이드)
CREATE TABLE size_charts (
    size_chart_id BIGSERIAL PRIMARY KEY,
    chart_name VARCHAR(100) NOT NULL, -- 차트 이름
    scope_type VARCHAR(20) NOT NULL, -- 'brand', 'category', 'product'
    scope_value VARCHAR(100), -- 브랜드명, 카테고리명, 상품ID
    chart_data JSONB NOT NULL, -- 사이즈 차트 데이터
    is_default BOOLEAN DEFAULT false, -- 기본 차트 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_size_variants_product_id ON size_variants(product_id);
CREATE INDEX idx_size_variants_sku ON size_variants(sku);
CREATE INDEX idx_size_variants_active ON size_variants(is_active);
CREATE INDEX idx_inventories_size_variant_id ON inventories(size_variant_id);
CREATE INDEX idx_inventories_stock ON inventories(stock_quantity);
CREATE INDEX idx_size_charts_scope ON size_charts(scope_type, scope_value);
CREATE INDEX idx_size_charts_default ON size_charts(is_default);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_size_variants_updated_at 
    BEFORE UPDATE ON size_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventories_updated_at 
    BEFORE UPDATE ON inventories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_size_charts_updated_at 
    BEFORE UPDATE ON size_charts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 사이즈 차트 데이터 삽입 (의류용)
INSERT INTO size_charts (chart_name, scope_type, scope_value, chart_data, is_default) VALUES
('의류 기본 사이즈', 'category', '의류', 
 '{
   "measurements": {
     "chest": {"XS": 85, "S": 90, "M": 95, "L": 100, "XL": 105, "XXL": 110},
     "waist": {"XS": 70, "S": 75, "M": 80, "L": 85, "XL": 90, "XXL": 95},
     "length": {"XS": 65, "S": 67, "M": 69, "L": 71, "XL": 73, "XXL": 75}
   },
   "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
   "unit": "cm"
 }', 
 true);

-- 신발용 사이즈 차트
INSERT INTO size_charts (chart_name, scope_type, scope_value, chart_data, is_default) VALUES
('신발 기본 사이즈', 'category', '신발', 
 '{
   "measurements": {
     "length": {"230": 23.0, "235": 23.5, "240": 24.0, "245": 24.5, "250": 25.0, "255": 25.5, "260": 26.0, "265": 26.5, "270": 27.0, "275": 27.5, "280": 28.0, "285": 28.5, "290": 29.0},
     "us": {"230": 6, "235": 6.5, "240": 7, "245": 7.5, "250": 8, "255": 8.5, "260": 9, "265": 9.5, "270": 10, "275": 10.5, "280": 11, "285": 11.5, "290": 12},
     "uk": {"230": 5, "235": 5.5, "240": 6, "245": 6.5, "250": 7, "255": 7.5, "260": 8, "265": 8.5, "270": 9, "275": 9.5, "280": 10, "285": 10.5, "290": 11}
   },
   "sizes": ["230", "235", "240", "245", "250", "255", "260", "265", "270", "275", "280", "285", "290"],
   "unit": "cm"
 }', 
 false);

-- 기존 상품들에 기본 사이즈 변형 추가 (S, M, L)
INSERT INTO size_variants (product_id, size_label, size_value, sku, sort_order)
SELECT 
    p.product_idx,
    size_label,
    size_label,
    CONCAT(p.product_idx, '-', size_label),
    CASE size_label 
        WHEN 'S' THEN 1 
        WHEN 'M' THEN 2 
        WHEN 'L' THEN 3 
        ELSE 4 
    END
FROM products p
CROSS JOIN (VALUES ('S'), ('M'), ('L')) AS sizes(size_label)
WHERE p.product_idx IS NOT NULL;

-- 기본 재고 데이터 추가 (각 사이즈별 10개씩)
INSERT INTO inventories (size_variant_id, stock_quantity, safety_stock)
SELECT 
    sv.size_variant_id,
    10, -- 기본 재고 10개
    2   -- 안전 재고 2개
FROM size_variants sv;
