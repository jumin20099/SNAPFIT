-- 사용자 실측 시스템 테이블 생성
-- V42: 사용자 실측 데이터 저장 및 관리

-- 사용자 실측 테이블
CREATE TABLE user_measurements (
    user_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    height_cm INTEGER, -- 키 (cm)
    weight_kg DECIMAL(5,2), -- 몸무게 (kg)
    chest_cm INTEGER, -- 가슴둘레 (cm)
    waist_cm INTEGER, -- 허리둘레 (cm)
    hip_cm INTEGER, -- 힙둘레 (cm)
    shoulder_cm INTEGER, -- 어깨너비 (cm)
    arm_length_cm INTEGER, -- 팔길이 (cm)
    leg_length_cm INTEGER, -- 다리길이 (cm)
    foot_length_cm INTEGER, -- 발길이 (cm)
    foot_width_cm INTEGER, -- 발너비 (cm)
    neck_cm INTEGER, -- 목둘레 (cm)
    thigh_cm INTEGER, -- 허벅지둘레 (cm)
    calf_cm INTEGER, -- 종아리둘레 (cm)
    wrist_cm INTEGER, -- 손목둘레 (cm)
    ankle_cm INTEGER, -- 발목둘레 (cm)
    is_public BOOLEAN DEFAULT false, -- 공개 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- 실측 히스토리 테이블 (변경 이력 추적)
CREATE TABLE measurement_history (
    history_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    measurement_data JSONB NOT NULL, -- 실측 데이터 JSON
    change_reason VARCHAR(100), -- 변경 사유 (직접입력, 구매후기반, 자동업데이트 등)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사이즈 추천 로그 테이블
CREATE TABLE size_recommendation_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_idx) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(product_idx) ON DELETE CASCADE,
    recommended_size VARCHAR(20), -- 추천된 사이즈
    confidence_score DECIMAL(3,2), -- 신뢰도 점수 (0.00-1.00)
    recommendation_reason TEXT, -- 추천 근거
    user_feedback BOOLEAN, -- 사용자 피드백 (좋음/나쁨)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_user_measurements_user_id ON user_measurements(user_id);
CREATE INDEX idx_measurement_history_user_id ON measurement_history(user_id);
CREATE INDEX idx_measurement_history_created_at ON measurement_history(created_at DESC);
CREATE INDEX idx_size_recommendation_logs_user_id ON size_recommendation_logs(user_id);
CREATE INDEX idx_size_recommendation_logs_product_id ON size_recommendation_logs(product_id);
CREATE INDEX idx_size_recommendation_logs_created_at ON size_recommendation_logs(created_at DESC);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_measurements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_user_measurements_updated_at 
    BEFORE UPDATE ON user_measurements 
    FOR EACH ROW EXECUTE FUNCTION update_measurements_updated_at();

-- 실측 데이터 변경 시 히스토리 자동 저장 트리거
CREATE OR REPLACE FUNCTION save_measurement_history()
RETURNS TRIGGER AS $$
BEGIN
    -- 기존 데이터가 있는 경우에만 히스토리 저장
    IF OLD IS NOT NULL THEN
        INSERT INTO measurement_history (user_id, measurement_data, change_reason)
        VALUES (
            OLD.user_id,
            to_jsonb(OLD),
            '자동업데이트'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER save_measurement_history_trigger
    AFTER UPDATE ON user_measurements
    FOR EACH ROW EXECUTE FUNCTION save_measurement_history();

-- 기본 실측 데이터 삽입 (테스트용)
INSERT INTO user_measurements (
    user_id, height_cm, weight_kg, chest_cm, waist_cm, hip_cm,
    shoulder_cm, arm_length_cm, leg_length_cm, foot_length_cm,
    is_public, created_at
) VALUES (
    '87b18a9c-d2ba-4318-b9aa-859e03c5aad7', -- 테스트 사용자 ID
    175, -- 175cm
    70.5, -- 70.5kg
    95, -- 가슴둘레 95cm
    80, -- 허리둘레 80cm
    100, -- 힙둘레 100cm
    45, -- 어깨너비 45cm
    60, -- 팔길이 60cm
    80, -- 다리길이 80cm
    26, -- 발길이 26cm
    false, -- 비공개
    CURRENT_TIMESTAMP
);
