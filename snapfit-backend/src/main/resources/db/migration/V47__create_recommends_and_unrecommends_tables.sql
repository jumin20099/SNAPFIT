-- 추천 테이블 생성
CREATE TABLE IF NOT EXISTS recommends (
    recommend_id BIGSERIAL PRIMARY KEY,
    user_idx UUID REFERENCES users(user_idx) ON DELETE CASCADE,
    guest_idx VARCHAR(255),
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT recommends_user_or_guest_check CHECK (
        (user_idx IS NOT NULL AND guest_idx IS NULL) OR
        (user_idx IS NULL AND guest_idx IS NOT NULL)
    )
);

-- 비추천 테이블 생성
CREATE TABLE IF NOT EXISTS unrecommends (
    recommend_id BIGSERIAL PRIMARY KEY,
    user_idx UUID REFERENCES users(user_idx) ON DELETE CASCADE,
    guest_idx VARCHAR(255),
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unrecommends_user_or_guest_check CHECK (
        (user_idx IS NOT NULL AND guest_idx IS NULL) OR
        (user_idx IS NULL AND guest_idx IS NOT NULL)
    )
);

-- 인덱스 생성 (로그인 사용자)
CREATE INDEX IF NOT EXISTS idx_recommends_user_post ON recommends(user_idx, post_id);
CREATE INDEX IF NOT EXISTS idx_unrecommends_user_post ON unrecommends(user_idx, post_id);

-- 인덱스 생성 (게스트 사용자)
CREATE INDEX IF NOT EXISTS idx_recommends_guest_post ON recommends(guest_idx, post_id);
CREATE INDEX IF NOT EXISTS idx_unrecommends_guest_post ON unrecommends(guest_idx, post_id);

-- 인덱스 생성 (게시글별 조회)
CREATE INDEX IF NOT EXISTS idx_recommends_post_id ON recommends(post_id);
CREATE INDEX IF NOT EXISTS idx_unrecommends_post_id ON unrecommends(post_id);

-- 코멘트
COMMENT ON TABLE recommends IS '게시글 추천 테이블 (로그인/비로그인 모두 지원)';
COMMENT ON TABLE unrecommends IS '게시글 비추천 테이블 (로그인/비로그인 모두 지원)';
COMMENT ON COLUMN recommends.user_idx IS '로그인 사용자 ID (user_idx 또는 guest_idx 중 하나만 필수)';
COMMENT ON COLUMN recommends.guest_idx IS '비로그인 사용자 식별자 (IP + User-Agent 해시)';
COMMENT ON COLUMN unrecommends.user_idx IS '로그인 사용자 ID (user_idx 또는 guest_idx 중 하나만 필수)';
COMMENT ON COLUMN unrecommends.guest_idx IS '비로그인 사용자 식별자 (IP + User-Agent 해시)';

