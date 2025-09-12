-- comments 테이블에 like_count 컬럼 추가
-- V27: add like_count column to comments table

-- like_count 컬럼 추가
ALTER TABLE comments ADD COLUMN like_count BIGINT DEFAULT 0;

-- like_count에 대한 체크 제약조건 추가
ALTER TABLE comments ADD CONSTRAINT chk_like_count_non_negative CHECK (like_count >= 0);

-- 댓글 수 업데이트를 위한 트리거 함수 (이미 존재할 수 있으므로 CREATE OR REPLACE 사용)
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET comment_count = comment_count + 1 
        WHERE post_id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET comment_count = GREATEST(comment_count - 1, 0) 
        WHERE post_id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 댓글 수 업데이트 트리거 (이미 존재할 수 있으므로 DROP IF EXISTS 후 재생성)
DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_count();
