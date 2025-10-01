-- 게시판 타입 컬럼 추가 및 추천/비추천 기능 추가
-- V43__add_board_type_to_posts.sql

-- board_type 컬럼 추가 (기본값: OUTFIT)
ALTER TABLE posts 
ADD COLUMN board_type VARCHAR(20) NOT NULL DEFAULT 'OUTFIT';

-- 추천/비추천 수 컬럼 추가
ALTER TABLE posts 
ADD COLUMN recommend_count BIGINT NOT NULL DEFAULT 0;

ALTER TABLE posts 
ADD COLUMN unrecommend_count BIGINT NOT NULL DEFAULT 0;

-- 미디어 URL 개수 제한 변경을 위한 체크 제약 조건 추가
-- (애플리케이션 레벨에서 처리하므로 DB 제약 조건은 추가하지 않음)

-- 인덱스 추가
CREATE INDEX idx_posts_board_type ON posts (board_type, created_at DESC);
CREATE INDEX idx_posts_board_type_deleted ON posts (board_type, is_deleted, created_at DESC);

-- 기존 데이터의 board_type을 OUTFIT으로 설정 (이미 기본값이지만 명시적으로 설정)
UPDATE posts SET board_type = 'OUTFIT' WHERE board_type IS NULL;

-- board_type 컬럼을 NOT NULL로 변경 (기본값이 설정되었으므로 안전)
-- ALTER TABLE posts ALTER COLUMN board_type SET NOT NULL; -- 이미 NOT NULL로 설정됨

-- 댓글 테이블에도 추천/비추천 기능 추가 (선택사항)
-- ALTER TABLE comments ADD COLUMN recommend_count BIGINT NOT NULL DEFAULT 0;
-- ALTER TABLE comments ADD COLUMN unrecommend_count BIGINT NOT NULL DEFAULT 0;
