-- V20__community_core.sql
-- 커뮤니티 시스템 핵심 테이블 생성
-- 보안, 성능, 확장성을 고려한 설계

-- 게시글 테이블 (posts)
CREATE TABLE IF NOT EXISTS posts (
    post_id BIGSERIAL PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    outfit_id BIGINT NULL REFERENCES outfits(outfit_idx) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 10000),
    media_urls TEXT[] DEFAULT '{}',
    is_sponsored BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count BIGINT DEFAULT 0 CHECK (like_count >= 0),
    scrap_count BIGINT DEFAULT 0 CHECK (scrap_count >= 0),
    comment_count BIGINT DEFAULT 0 CHECK (comment_count >= 0),
    view_count BIGINT DEFAULT 0 CHECK (view_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 보안: 작성자만 수정/삭제 가능하도록 제약
    CONSTRAINT posts_content_length_check CHECK (length(trim(content)) > 0)
);

-- 성능 최적화를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC, post_id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_outfit_id ON posts(outfit_id) WHERE outfit_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_deleted ON posts(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_sponsored ON posts(is_sponsored, created_at DESC) WHERE is_sponsored = TRUE;

-- 스크랩 테이블 (scraps) - 사용자별 게시글 북마크
CREATE TABLE IF NOT EXISTS scraps (
    user_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 보안: 중복 스크랩 방지
    PRIMARY KEY(user_id, post_id),
    
    -- 성능: 사용자별 스크랩 조회 최적화
    CONSTRAINT unique_user_post_scrap UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_scraps_user_id ON scraps(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraps_post_id ON scraps(post_id);

-- 팔로우 테이블 (follows) - 사용자 간 팔로우 관계
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 보안: 자기 자신 팔로우 방지
    PRIMARY KEY(follower_id, followee_id),
    CONSTRAINT follows_self_follow_check CHECK (follower_id != followee_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_followee_id ON follows(followee_id, created_at DESC);

-- 태그 테이블 (tags) - 게시글 태그
CREATE TABLE IF NOT EXISTS tags (
    tag_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL CHECK (length(name) >= 1 AND length(name) <= 50),
    post_count BIGINT DEFAULT 0 CHECK (post_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 보안: 태그명 정규화 및 길이 제한
    CONSTRAINT tags_name_format_check CHECK (name ~ '^[a-zA-Z0-9가-힣_]+$')
);

-- 성능: 태그 검색 최적화
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_post_count ON tags(post_count DESC, created_at DESC);

-- 게시글-태그 연결 테이블 (post_tags)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    
    -- 보안: 중복 태그 방지
    PRIMARY KEY(post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- 댓글 테이블 (comments)
CREATE TABLE IF NOT EXISTS comments (
    comment_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    parent_id BIGINT NULL REFERENCES comments(comment_id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 보안: 댓글 내용 길이 제한 및 부모 댓글 참조 무결성
    CONSTRAINT comments_content_length_check CHECK (length(trim(content)) > 0),
    CONSTRAINT comments_parent_author_check CHECK (
        parent_id IS NULL OR 
        EXISTS (SELECT 1 FROM comments c WHERE c.comment_id = parent_id AND c.post_id = post_id)
    )
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- 알림 테이블 (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('LIKE', 'COMMENT', 'FOLLOW', 'SCRAP', 'MENTION', 'REPORT_RESULT', 'SYSTEM')),
    ref_id BIGINT NULL,
    payload_json JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 보안: 알림 타입 검증 및 페이로드 크기 제한
    CONSTRAINT notifications_payload_size_check CHECK (jsonb_array_length(payload_json) <= 10)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);

-- 신고 테이블 (reports)
CREATE TABLE IF NOT EXISTS reports (
    report_id BIGSERIAL PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('POST', 'COMMENT', 'USER')),
    target_id BIGINT NOT NULL,
    reason VARCHAR(100) NOT NULL CHECK (length(reason) >= 1 AND length(reason) <= 100),
    status VARCHAR(16) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED')),
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 보안: 신고 사유 길이 제한 및 상태 검증
    CONSTRAINT reports_reason_length_check CHECK (length(trim(reason)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

-- 차단 테이블 (blocks)
CREATE TABLE IF NOT EXISTS blocks (
    blocker_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    reason VARCHAR(200) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 보안: 자기 자신 차단 방지
    PRIMARY KEY(blocker_id, blocked_user_id),
    CONSTRAINT blocks_self_block_check CHECK (blocker_id != blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_user_id ON blocks(blocked_user_id);

-- 검색 최적화를 위한 확장 및 인덱스
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- 게시글 내용 검색 최적화 (한글 지원)
CREATE INDEX IF NOT EXISTS idx_posts_content_trgm ON posts USING GIN (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_comments_content_trgm ON comments USING GIN (content gin_trgm_ops);

-- 태그명 검색 최적화
CREATE INDEX IF NOT EXISTS idx_tags_name_trgm ON tags USING GIN (name gin_trgm_ops);

-- 랭킹 계산을 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_ranking ON posts (
    (like_count * 3 + scrap_count * 2 + comment_count + view_count * 0.1) DESC,
    created_at DESC
) WHERE is_deleted = FALSE;

-- 팔로우 피드 최적화를 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_follow_feed ON posts (
    author_id,
    created_at DESC,
    post_id DESC
) WHERE is_deleted = FALSE;

-- 댓글 트리 구조 최적화
CREATE INDEX IF NOT EXISTS idx_comments_tree ON comments (
    post_id,
    COALESCE(parent_id, 0),
    created_at ASC
);

-- 통계 뷰 생성 (성능 최적화)
CREATE OR REPLACE VIEW post_stats AS
SELECT 
    p.post_id,
    p.author_id,
    p.like_count,
    p.scrap_count,
    p.comment_count,
    p.view_count,
    p.created_at,
    -- 랭킹 점수 계산 (가중치 기반)
    (p.like_count * 3 + p.scrap_count * 2 + p.comment_count + p.view_count * 0.1) as ranking_score
FROM posts p
WHERE p.is_deleted = FALSE;

-- 보안을 위한 RLS (Row Level Security) 설정
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraps ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (예시)
CREATE POLICY posts_select_policy ON posts
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY posts_insert_policy ON posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY posts_update_policy ON posts
    FOR UPDATE USING (author_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY posts_delete_policy ON posts
    FOR DELETE USING (author_id = current_setting('app.current_user_id')::UUID);

-- 성능 모니터링을 위한 함수
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 새 댓글 추가 시 게시글 댓글 수 증가
        UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 댓글 삭제 시 게시글 댓글 수 감소
        UPDATE posts SET comment_count = comment_count - 1 WHERE post_id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 댓글 수 자동 업데이트 트리거
CREATE TRIGGER update_post_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

-- 태그 카운트 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_tag_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET post_count = post_count + 1 WHERE tag_id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET post_count = post_count - 1 WHERE tag_id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 태그 카운트 자동 업데이트 트리거
CREATE TRIGGER update_tag_post_count
    AFTER INSERT OR DELETE ON post_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_counters();

-- 댓글 삭제 시 soft delete 처리
CREATE OR REPLACE FUNCTION soft_delete_comment()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
        -- 댓글 soft delete 시 게시글 댓글 수 감소
        UPDATE posts SET comment_count = comment_count - 1 WHERE post_id = OLD.post_id;
    ELSIF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
        -- 댓글 복구 시 게시글 댓글 수 증가
        UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 댓글 soft delete 트리거
CREATE TRIGGER soft_delete_comment_trigger
    AFTER UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION soft_delete_comment();

-- 성능 최적화를 위한 통계 정보 업데이트
ANALYZE;
