-- 리뷰 시스템 테이블 생성
CREATE TABLE product_reviews (
    review_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    images JSONB,
    helpful_count INTEGER DEFAULT 0,
    is_reported BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'BLINDED', 'DELETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_idx) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_idx) ON DELETE CASCADE
);

-- 리뷰 인덱스 생성
CREATE INDEX idx_product_reviews_product_id_created_at ON product_reviews(product_id, created_at DESC);
CREATE INDEX idx_product_reviews_product_id_rating ON product_reviews(product_id, rating);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);

-- 상품 테이블에 리뷰 통계 컬럼 추가
ALTER TABLE products ADD COLUMN rating_avg NUMERIC(3,2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;

-- 리뷰 통계 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 상품의 리뷰 통계 업데이트
    UPDATE products 
    SET 
        rating_avg = (
            SELECT COALESCE(AVG(rating), 0.00) 
            FROM product_reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
            AND status = 'PUBLISHED'
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM product_reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
            AND status = 'PUBLISHED'
        )
    WHERE product_idx = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 리뷰 변경 시 통계 업데이트 트리거
CREATE TRIGGER trigger_update_product_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_review_stats();

-- 기존 상품들의 리뷰 통계 초기화 (현재는 0으로 설정)
UPDATE products 
SET rating_avg = 0.00, review_count = 0;
