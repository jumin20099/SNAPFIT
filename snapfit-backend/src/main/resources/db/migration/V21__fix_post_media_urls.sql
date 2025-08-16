-- V21__fix_post_media_urls.sql
-- Post 엔티티의 mediaUrls 필드 구조 수정
-- TEXT[] 배열을 JSONB로 변경

-- 기존 media_urls 컬럼을 JSONB로 변경
ALTER TABLE posts 
ALTER COLUMN media_urls TYPE JSONB USING 
  CASE 
    WHEN media_urls IS NULL THEN '[]'::jsonb
    WHEN array_length(media_urls, 1) IS NULL THEN '[]'::jsonb
    ELSE array_to_json(media_urls)::jsonb
  END;

-- 기본값 설정
ALTER TABLE posts ALTER COLUMN media_urls SET DEFAULT '[]'::jsonb;

-- JSONB 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_media_urls_gin ON posts USING GIN (media_urls);

-- 기존 post_media_urls 테이블이 있다면 제거 (필요시)
-- DROP TABLE IF EXISTS post_media_urls CASCADE;
