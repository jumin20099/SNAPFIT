-- 테스트용 제휴사 데이터 추가
INSERT INTO stores (store_name, store_logo, store_link, royalty_rate, contact, is_active) VALUES
('테스트몰1', 'https://via.placeholder.com/150', 'https://testmall1.com', 0.1, 'contact1@test.com', true),
('테스트몰2', 'https://via.placeholder.com/150', 'https://testmall2.com', 0.15, 'contact2@test.com', true),
('테스트몰3', 'https://via.placeholder.com/150', 'https://testmall3.com', 0.12, 'contact3@test.com', true)
ON CONFLICT DO NOTHING;

-- 테스트용 상품 데이터 추가
INSERT INTO products (store_idx, product_name, product_content, product_price, product_image, product_category, gender_category, major_category, sub_category, product_link, is_active) VALUES
(1, '테스트 상품 1 - 스니커즈', '편안하고 스타일리시한 스니커즈입니다. 일상생활에서 착용하기 좋은 제품입니다.', 89000, 'https://via.placeholder.com/300x300', '신발', '전체', '신발', '스니커즈', 'https://testmall1.com/product1', true),
(1, '테스트 상품 2 - 맨투맨', '부드럽고 따뜻한 맨투맨입니다. 가을과 겨울에 착용하기 좋은 제품입니다.', 45000, 'https://via.placeholder.com/300x300', '상의', '전체', '상의', '맨투맨/스웨트', 'https://testmall1.com/product2', true),
(2, '테스트 상품 3 - 후드 집업', '스타일리시한 후드 집업입니다. 캐주얼한 룩에 잘 어울립니다.', 65000, 'https://via.placeholder.com/300x300', '아우터', '전체', '아우터', '후드 집업', 'https://testmall2.com/product3', true),
(2, '테스트 상품 4 - 데님 팬츠', '클래식한 데님 팬츠입니다. 어떤 상의와도 잘 어울립니다.', 78000, 'https://via.placeholder.com/300x300', '바지', '전체', '바지', '데님 팬츠', 'https://testmall2.com/product4', true),
(3, '테스트 상품 5 - 백팩', '실용적인 백팩입니다. 일상생활에서 사용하기 좋은 제품입니다.', 120000, 'https://via.placeholder.com/300x300', '가방', '전체', '가방', '백팩', 'https://testmall3.com/product5', true),
(3, '테스트 상품 6 - 모자', '스타일리시한 모자입니다. 헤어스타일을 완성하는 아이템입니다.', 25000, 'https://via.placeholder.com/300x300', '패션소품', '전체', '패션소품', '모자', 'https://testmall3.com/product6', true),
(1, '테스트 상품 7 - 구두', '엘레간트한 구두입니다. 정장과 함께 착용하기 좋습니다.', 150000, 'https://via.placeholder.com/300x300', '신발', '전체', '신발', '구두', 'https://testmall1.com/product7', true),
(2, '테스트 상품 8 - 셔츠', '클래식한 셔츠입니다. 비즈니스 룩에 완벽합니다.', 85000, 'https://via.placeholder.com/300x300', '상의', '전체', '상의', '셔츠/블라우스', 'https://testmall2.com/product8', true),
(3, '테스트 상품 9 - 토트백', '실용적인 토트백입니다. 여성들에게 인기 있는 제품입니다.', 95000, 'https://via.placeholder.com/300x300', '가방', '전체', '가방', '토트백', 'https://testmall3.com/product9', true),
(1, '테스트 상품 10 - 선글라스', '스타일리시한 선글라스입니다. 여름철 필수 아이템입니다.', 35000, 'https://via.placeholder.com/300x300', '패션소품', '전체', '패션소품', '선글라스/안경테', 'https://testmall1.com/product10', true)
ON CONFLICT DO NOTHING; 