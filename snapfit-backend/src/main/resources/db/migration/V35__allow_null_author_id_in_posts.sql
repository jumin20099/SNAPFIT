-- V35__allow_null_author_id_in_posts.sql
ALTER TABLE posts
ALTER COLUMN author_id DROP NOT NULL;
