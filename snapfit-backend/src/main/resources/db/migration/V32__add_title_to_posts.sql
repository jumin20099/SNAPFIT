-- 게시글 테이블에 title 컬럼 추가
ALTER TABLE posts ADD COLUMN title VARCHAR(100);

-- title 컬럼에 인덱스 추가 (검색 성능 향상)
CREATE INDEX idx_posts_title ON posts(title);

-- 기존 게시글의 title을 content의 첫 50자로 설정 (선택사항)
UPDATE posts SET title = LEFT(content, 50) WHERE title IS NULL;
