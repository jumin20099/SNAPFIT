-- User 테이블에 프로필 필드 추가 (이미 존재하는 경우 무시)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Follow 테이블 생성 (이미 존재하는 경우 무시)
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id <> followee_id)
);

-- 인덱스 생성 (이미 존재하는 경우 무시)
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_followee_id ON follows(followee_id, created_at DESC);
