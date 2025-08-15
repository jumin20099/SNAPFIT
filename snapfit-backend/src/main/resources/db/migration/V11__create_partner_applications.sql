-- V11__create_partner_applications.sql
-- partner_applications 테이블 생성

CREATE TABLE IF NOT EXISTS partner_applications (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(255) NOT NULL,
    business_registration VARCHAR(255) NOT NULL,
    business_registration_file TEXT,
    logo TEXT,
    store_link VARCHAR(500),
    royalty_rate FLOAT,
    user_idx UUID NOT NULL,
    store_idx INTEGER,
    application_date TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 외래키 제약조건 추가
ALTER TABLE partner_applications
    ADD CONSTRAINT fk_partner_applications_stores FOREIGN KEY (store_idx) REFERENCES stores(store_idx);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_partner_applications_user_idx ON partner_applications(user_idx);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON partner_applications(status);
CREATE INDEX IF NOT EXISTS idx_partner_applications_store_idx ON partner_applications(store_idx);
