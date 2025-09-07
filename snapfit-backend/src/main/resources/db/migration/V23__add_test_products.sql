-- 테스트 상품 데이터 추가
INSERT INTO products (product_name, product_content, product_price, product_image, major_category, sub_category, gender_category, is_active, created_at, updated_at) VALUES
-- 상의 카테고리
('기본 티셔츠', '편안한 기본 티셔츠입니다.', 29000, 'https://picsum.photos/seed/tee1/400/400', 'tops', '반소매 티셔츠', 'UNISEX', true, now(), now()),
('맨투맨 스웨트', '따뜻한 맨투맨 스웨트셔츠입니다.', 39000, 'https://picsum.photos/seed/sweat1/400/400', 'tops', '맨투맨/스웨트', 'UNISEX', true, now(), now()),
('후드 티셔츠', '스타일리시한 후드 티셔츠입니다.', 45000, 'https://picsum.photos/seed/hoodie1/400/400', 'tops', '후드 티셔츠', 'UNISEX', true, now(), now()),
('셔츠 블라우스', '깔끔한 셔츠 블라우스입니다.', 55000, 'https://picsum.photos/seed/shirt1/400/400', 'tops', '셔츠/블라우스', 'UNISEX', true, now(), now()),
('긴소매 티셔츠', '따뜻한 긴소매 티셔츠입니다.', 35000, 'https://picsum.photos/seed/longsleeve1/400/400', 'tops', '긴소매 티셔츠', 'UNISEX', true, now(), now()),
('피케 카라 티셔츠', '클래식한 피케 카라 티셔츠입니다.', 42000, 'https://picsum.photos/seed/pique1/400/400', 'tops', '피케/카라 티셔츠', 'UNISEX', true, now(), now()),
('니트 스웨터', '부드러운 니트 스웨터입니다.', 65000, 'https://picsum.photos/seed/knit1/400/400', 'tops', '니트/스웨터', 'UNISEX', true, now(), now()),
('민소매 티셔츠', '시원한 민소매 티셔츠입니다.', 25000, 'https://picsum.photos/seed/sleeveless1/400/400', 'tops', '민소매 티셔츠', 'UNISEX', true, now(), now()),

-- 아우터 카테고리
('블랙 코트', '세련된 블랙 코트입니다.', 129000, 'https://picsum.photos/seed/coat1/400/400', 'outerwear', '코트', 'UNISEX', true, now(), now()),
('블루종', '캐주얼한 블루종입니다.', 89000, 'https://picsum.photos/seed/blouson1/400/400', 'outerwear', '블루종', 'UNISEX', true, now(), now()),
('가디건', '부드러운 가디건입니다.', 75000, 'https://picsum.photos/seed/cardigan1/400/400', 'outerwear', '가디건', 'UNISEX', true, now(), now()),

-- 하의 카테고리
('와이드 데님', '편안한 와이드 데님입니다.', 59000, 'https://picsum.photos/seed/denim1/400/400', 'pants', '데님', 'MALE', true, now(), now()),
('슬랙스', '정장용 슬랙스입니다.', 45000, 'https://picsum.photos/seed/slacks1/400/400', 'pants', '슬랙스', 'UNISEX', true, now(), now()),

-- 신발 카테고리
('러닝화', '편안한 러닝화입니다.', 99000, 'https://picsum.photos/seed/shoes1/400/400', 'shoes', '운동화', 'UNISEX', true, now(), now()),
('구두', '정장용 구두입니다.', 120000, 'https://picsum.photos/seed/dressshoes1/400/400', 'shoes', '구두', 'UNISEX', true, now(), now()),

-- 가방 카테고리
('캔버스 백', '실용적인 캔버스 백입니다.', 49000, 'https://picsum.photos/seed/bag1/400/400', 'bags', '크로스', 'UNISEX', true, now(), now()),
('백팩', '등산용 백팩입니다.', 65000, 'https://picsum.photos/seed/backpack1/400/400', 'bags', '백팩', 'UNISEX', true, now(), now()),

-- 원피스/스커트 카테고리
('플레어 스커트', '우아한 플레어 스커트입니다.', 49000, 'https://picsum.photos/seed/skirt1/400/400', 'dresses', '스커트 전용', 'FEMALE', true, now(), now()),
('원피스', '세련된 원피스입니다.', 75000, 'https://picsum.photos/seed/dress1/400/400', 'dresses', '원피스', 'FEMALE', true, now(), now()),

-- 액세서리 카테고리
('울 비니', '따뜻한 울 비니입니다.', 19000, 'https://picsum.photos/seed/beanie1/400/400', 'accessories', '모자', 'UNISEX', true, now(), now()),
('양말', '편안한 양말입니다.', 8000, 'https://picsum.photos/seed/socks1/400/400', 'accessories', '양말', 'UNISEX', true, now(), now());
