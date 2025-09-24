-- V43__add_anonymous_password_hash_to_posts.sql
-- 게시글 익명 비밀번호 해시 저장 컬럼 추가

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS anonymous_password_hash VARCHAR(255);
