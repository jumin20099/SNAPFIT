-- 코디 테이블에 이름 컬럼 추가
ALTER TABLE outfits ADD COLUMN outfit_name VARCHAR(100) NOT NULL DEFAULT '코디';

-- 기본값 제거 (이제 NOT NULL 제약조건만 유지)
ALTER TABLE outfits ALTER COLUMN outfit_name DROP DEFAULT;
