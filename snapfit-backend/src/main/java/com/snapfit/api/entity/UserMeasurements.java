package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_measurements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMeasurements {
    
    @Id
    @Column(name = "user_id")
    private UUID userId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @Column(name = "height_cm")
    private Integer heightCm; // 키 (cm)
    
    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg; // 몸무게 (kg)
    
    @Column(name = "chest_cm")
    private Integer chestCm; // 가슴둘레 (cm)
    
    @Column(name = "waist_cm")
    private Integer waistCm; // 허리둘레 (cm)
    
    @Column(name = "hip_cm")
    private Integer hipCm; // 힙둘레 (cm)
    
    @Column(name = "shoulder_cm")
    private Integer shoulderCm; // 어깨너비 (cm)
    
    @Column(name = "arm_length_cm")
    private Integer armLengthCm; // 팔길이 (cm)
    
    @Column(name = "leg_length_cm")
    private Integer legLengthCm; // 다리길이 (cm)
    
    @Column(name = "foot_length_cm")
    private Integer footLengthCm; // 발길이 (cm)
    
    @Column(name = "foot_width_cm")
    private Integer footWidthCm; // 발너비 (cm)
    
    @Column(name = "neck_cm")
    private Integer neckCm; // 목둘레 (cm)
    
    @Column(name = "thigh_cm")
    private Integer thighCm; // 허벅지둘레 (cm)
    
    @Column(name = "calf_cm")
    private Integer calfCm; // 종아리둘레 (cm)
    
    @Column(name = "wrist_cm")
    private Integer wristCm; // 손목둘레 (cm)
    
    @Column(name = "ankle_cm")
    private Integer ankleCm; // 발목둘레 (cm)
    
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = false; // 공개 여부
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 실측 데이터 완성도 계산
    public int getCompletionPercentage() {
        int totalFields = 15; // 총 실측 필드 수
        int filledFields = 0;
        
        if (heightCm != null) filledFields++;
        if (weightKg != null) filledFields++;
        if (chestCm != null) filledFields++;
        if (waistCm != null) filledFields++;
        if (hipCm != null) filledFields++;
        if (shoulderCm != null) filledFields++;
        if (armLengthCm != null) filledFields++;
        if (legLengthCm != null) filledFields++;
        if (footLengthCm != null) filledFields++;
        if (footWidthCm != null) filledFields++;
        if (neckCm != null) filledFields++;
        if (thighCm != null) filledFields++;
        if (calfCm != null) filledFields++;
        if (wristCm != null) filledFields++;
        if (ankleCm != null) filledFields++;
        
        return (filledFields * 100) / totalFields;
    }
    
    // 기본 실측 데이터가 있는지 확인
    public boolean hasBasicMeasurements() {
        return heightCm != null && weightKg != null && chestCm != null && waistCm != null;
    }
    
    // 상세 실측 데이터가 있는지 확인
    public boolean hasDetailedMeasurements() {
        return hasBasicMeasurements() && 
               shoulderCm != null && armLengthCm != null && legLengthCm != null;
    }
    
    // BMI 계산
    public BigDecimal calculateBMI() {
        if (heightCm == null || weightKg == null || heightCm == 0) {
            return null;
        }
        
        double heightInMeters = heightCm / 100.0;
        return weightKg.divide(BigDecimal.valueOf(heightInMeters * heightInMeters), 2, BigDecimal.ROUND_HALF_UP);
    }
    
    // BMI 분류
    public String getBMICategory() {
        BigDecimal bmi = calculateBMI();
        if (bmi == null) return "계산불가";
        
        double bmiValue = bmi.doubleValue();
        if (bmiValue < 18.5) return "저체중";
        if (bmiValue < 23) return "정상";
        if (bmiValue < 25) return "과체중";
        if (bmiValue < 30) return "경도비만";
        return "고도비만";
    }
}
