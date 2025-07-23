-- 코디(outfits) 및 좋아요(likes) 테이블 생성
CREATE TABLE IF NOT EXISTS outfits (
    outfit_idx SERIAL PRIMARY KEY,
    user_idx UUID NOT NULL,
    outfit_item JSONB NOT NULL,
    outfit_thumbnail TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE outfits
    ADD CONSTRAINT fk_outfits_users FOREIGN KEY (user_idx) REFERENCES users(user_idx);

CREATE TABLE IF NOT EXISTS likes (
    like_idx SERIAL PRIMARY KEY,
    user_idx UUID,
    target_idx BIGINT NOT NULL,
    guest_idx VARCHAR(255),
    target_type VARCHAR(50) NOT NULL,
    is_like BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT unique_like UNIQUE (user_idx, target_type, target_idx)
);

ALTER TABLE likes
    ADD CONSTRAINT fk_likes_users FOREIGN KEY (user_idx) REFERENCES users(user_idx); 