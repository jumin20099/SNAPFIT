-- 댓글 수 제약 조건 문제 수정
-- comment_count가 0보다 작아지지 않도록 함수 수정

CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 새 댓글 추가 시 게시글 댓글 수 증가
        UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 댓글 삭제 시 게시글 댓글 수 감소 (0보다 작아지지 않도록)
        UPDATE posts 
        SET comment_count = GREATEST(comment_count - 1, 0) 
        WHERE post_id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
