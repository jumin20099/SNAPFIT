-- 문의 시스템 테이블 생성
CREATE TABLE product_inquiries (
    inquiry_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ANSWERED', 'CLOSED')),
    answer TEXT,
    answered_by UUID,
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_idx) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_idx) ON DELETE CASCADE,
    FOREIGN KEY (answered_by) REFERENCES users(user_idx) ON DELETE SET NULL
);

-- 문의 인덱스 생성
CREATE INDEX idx_product_inquiries_product_id_created_at ON product_inquiries(product_id, created_at DESC);
CREATE INDEX idx_product_inquiries_product_id_status ON product_inquiries(product_id, status);
CREATE INDEX idx_product_inquiries_user_id ON product_inquiries(user_id);
CREATE INDEX idx_product_inquiries_status ON product_inquiries(status);
CREATE INDEX idx_product_inquiries_answered_by ON product_inquiries(answered_by);

-- 문의 통계를 위한 뷰 생성
CREATE VIEW product_inquiry_stats AS
SELECT 
    product_id,
    COUNT(*) as total_inquiries,
    COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_inquiries,
    COUNT(CASE WHEN status = 'ANSWERED' THEN 1 END) as answered_inquiries,
    COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed_inquiries,
    COUNT(CASE WHEN is_private = true THEN 1 END) as private_inquiries
FROM product_inquiries
GROUP BY product_id;
