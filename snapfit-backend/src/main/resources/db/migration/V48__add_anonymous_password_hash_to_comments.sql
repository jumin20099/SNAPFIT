-- 댓글 테이블에 익명 비밀번호 해시 컬럼 추가
ALTER TABLE comments ADD COLUMN anonymous_password_hash VARCHAR(255);
