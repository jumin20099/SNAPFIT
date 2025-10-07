-- 댓글 좋아요 테이블에 익명 관련 컬럼 추가
ALTER TABLE comment_likes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE comment_likes ADD COLUMN anonymous_index INT;
ALTER TABLE comment_likes ADD COLUMN anonymous_password_hash VARCHAR(255);

-- 익명 좋아요를 위한 유니크 제약조건 추가
ALTER TABLE comment_likes ADD CONSTRAINT uk_comment_likes_anonymous 
UNIQUE (comment_id, anonymous_index);

