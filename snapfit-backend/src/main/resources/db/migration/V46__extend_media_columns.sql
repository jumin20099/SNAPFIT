-- V46__extend_media_columns.sql

-- media 테이블의 컬럼 길이 확장
ALTER TABLE media 
    ALTER COLUMN media_uid_name TYPE VARCHAR(500),
    ALTER COLUMN media_url TYPE VARCHAR(1000),
    ALTER COLUMN media_real_name TYPE VARCHAR(500);
