-- V33__add_anonymous_indexing.sql
-- 익명 사용자 인덱싱을 위한 컬럼 추가

-- posts 테이블에 익명 인덱스 컬럼 추가
ALTER TABLE posts
    ADD COLUMN anonymous_index_counter INTEGER DEFAULT 0;

-- comments 테이블에 익명 인덱스 컬럼 추가
ALTER TABLE comments
    ADD COLUMN anonymous_index INTEGER;

-- 익명 사용자 매핑을 위한 테이블 생성
CREATE TABLE anonymous_user_mapping (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_identifier VARCHAR(255) NOT NULL, -- IP 주소나 세션 ID 등
    anonymous_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_identifier)
);

-- 인덱스 추가
CREATE INDEX idx_anonymous_user_mapping_post_id ON anonymous_user_mapping (post_id);
CREATE INDEX idx_anonymous_user_mapping_user_identifier ON anonymous_user_mapping (user_identifier);
