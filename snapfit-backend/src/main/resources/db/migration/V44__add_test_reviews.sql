-- 테스트용 리뷰 데이터 추가
-- 먼저 기존 상품들의 평점과 리뷰 수를 업데이트

-- 상품 1에 대한 리뷰들
INSERT INTO product_reviews (product_id, user_id, rating, content, status, created_at) VALUES
(1, (SELECT user_idx FROM users LIMIT 1), 5, '정말 좋은 상품이에요!', 'PUBLISHED', NOW() - INTERVAL '5 days'),
(1, (SELECT user_idx FROM users LIMIT 1 OFFSET 1), 4, '가격 대비 만족스러워요', 'PUBLISHED', NOW() - INTERVAL '3 days'),
(1, (SELECT user_idx FROM users LIMIT 1 OFFSET 2), 5, '품질이 좋습니다', 'PUBLISHED', NOW() - INTERVAL '1 day');

-- 상품 2에 대한 리뷰들
INSERT INTO product_reviews (product_id, user_id, rating, content, status, created_at) VALUES
(2, (SELECT user_idx FROM users LIMIT 1), 4, '괜찮은 상품입니다', 'PUBLISHED', NOW() - INTERVAL '4 days'),
(2, (SELECT user_idx FROM users LIMIT 1 OFFSET 1), 3, '보통이에요', 'PUBLISHED', NOW() - INTERVAL '2 days');

-- 상품 3에 대한 리뷰들
INSERT INTO product_reviews (product_id, user_id, rating, content, status, created_at) VALUES
(3, (SELECT user_idx FROM users LIMIT 1), 5, '최고예요!', 'PUBLISHED', NOW() - INTERVAL '6 days'),
(3, (SELECT user_idx FROM users LIMIT 1 OFFSET 1), 5, '정말 추천합니다', 'PUBLISHED', NOW() - INTERVAL '4 days'),
(3, (SELECT user_idx FROM users LIMIT 1 OFFSET 2), 4, '좋은 상품이에요', 'PUBLISHED', NOW() - INTERVAL '2 days'),
(3, (SELECT user_idx FROM users LIMIT 1 OFFSET 3), 5, '완벽해요', 'PUBLISHED', NOW() - INTERVAL '1 day');

-- 상품 4에 대한 리뷰들
INSERT INTO product_reviews (product_id, user_id, rating, content, status, created_at) VALUES
(4, (SELECT user_idx FROM users LIMIT 1), 2, '별로예요', 'PUBLISHED', NOW() - INTERVAL '3 days'),
(4, (SELECT user_idx FROM users LIMIT 1 OFFSET 1), 3, '아쉬워요', 'PUBLISHED', NOW() - INTERVAL '1 day');

-- 상품 5에 대한 리뷰들
INSERT INTO product_reviews (product_id, user_id, rating, content, status, created_at) VALUES
(5, (SELECT user_idx FROM users LIMIT 1), 4, '괜찮습니다', 'PUBLISHED', NOW() - INTERVAL '5 days'),
(5, (SELECT user_idx FROM users LIMIT 1 OFFSET 1), 4, '만족스러워요', 'PUBLISHED', NOW() - INTERVAL '3 days'),
(5, (SELECT user_idx FROM users LIMIT 1 OFFSET 2), 5, '좋아요', 'PUBLISHED', NOW() - INTERVAL '1 day');

-- 트리거가 자동으로 평점과 리뷰 수를 업데이트할 것입니다.
-- 하지만 수동으로도 업데이트해보겠습니다.

UPDATE products 
SET 
    rating_avg = (
        SELECT COALESCE(AVG(rating), 0.00) 
        FROM product_reviews 
        WHERE product_id = products.product_idx 
        AND status = 'PUBLISHED'
    ),
    review_count = (
        SELECT COUNT(*) 
        FROM product_reviews 
        WHERE product_id = products.product_idx 
        AND status = 'PUBLISHED'
    )
WHERE product_idx IN (1, 2, 3, 4, 5);
