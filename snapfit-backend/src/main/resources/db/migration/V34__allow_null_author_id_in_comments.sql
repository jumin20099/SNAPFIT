-- V34__allow_null_author_id_in_comments.sql
-- 익명 사용자 댓글 작성을 위해 author_id를 nullable로 변경

ALTER TABLE comments 
    ALTER COLUMN author_id DROP NOT NULL;
