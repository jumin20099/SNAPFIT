package com.snapfit.api.dto;

import com.snapfit.api.entity.UserMeasurements;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMeasurementsDto {
    
    private String userId;
    private Integer heightCm;
    private BigDecimal weightKg;
    private Integer chestCm;
    private Integer waistCm;
    private Integer hipCm;
    private Integer shoulderCm;
    private Integer armLengthCm;
    private Integer legLengthCm;
    private Integer footLengthCm;
    private Integer footWidthCm;
    private Integer neckCm;
    private Integer thighCm;
    private Integer calfCm;
    private Integer wristCm;
    private Integer ankleCm;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 계산된 필드들
    private Integer completionPercentage;
    private Boolean hasBasicMeasurements;
    private Boolean hasDetailedMeasurements;
    private BigDecimal bmi;
    private String bmiCategory;
    
    public static UserMeasurementsDto from(UserMeasurements measurements) {
        if (measurements == null) return null;
        
        return UserMeasurementsDto.builder()
                .userId(measurements.getUserId().toString())
                .heightCm(measurements.getHeightCm())
                .weightKg(measurements.getWeightKg())
                .chestCm(measurements.getChestCm())
                .waistCm(measurements.getWaistCm())
                .hipCm(measurements.getHipCm())
                .shoulderCm(measurements.getShoulderCm())
                .armLengthCm(measurements.getArmLengthCm())
                .legLengthCm(measurements.getLegLengthCm())
                .footLengthCm(measurements.getFootLengthCm())
                .footWidthCm(measurements.getFootWidthCm())
                .neckCm(measurements.getNeckCm())
                .thighCm(measurements.getThighCm())
                .calfCm(measurements.getCalfCm())
                .wristCm(measurements.getWristCm())
                .ankleCm(measurements.getAnkleCm())
                .isPublic(measurements.getIsPublic())
                .createdAt(measurements.getCreatedAt())
                .updatedAt(measurements.getUpdatedAt())
                .completionPercentage(measurements.getCompletionPercentage())
                .hasBasicMeasurements(measurements.hasBasicMeasurements())
                .hasDetailedMeasurements(measurements.hasDetailedMeasurements())
                .bmi(measurements.calculateBMI())
                .bmiCategory(measurements.getBMICategory())
                .build();
    }
    
    // 간단한 실측 정보만 포함하는 DTO
    public static UserMeasurementsDto simple(UserMeasurements measurements) {
        if (measurements == null) return null;
        
        return UserMeasurementsDto.builder()
                .userId(measurements.getUserId().toString())
                .heightCm(measurements.getHeightCm())
                .weightKg(measurements.getWeightKg())
                .chestCm(measurements.getChestCm())
                .waistCm(measurements.getWaistCm())
                .hipCm(measurements.getHipCm())
                .completionPercentage(measurements.getCompletionPercentage())
                .hasBasicMeasurements(measurements.hasBasicMeasurements())
                .build();
    }
    
    // 실측 데이터 요약 정보
    public static UserMeasurementsDto summary(UserMeasurements measurements) {
        if (measurements == null) return null;
        
        return UserMeasurementsDto.builder()
                .userId(measurements.getUserId().toString())
                .completionPercentage(measurements.getCompletionPercentage())
                .hasBasicMeasurements(measurements.hasBasicMeasurements())
                .hasDetailedMeasurements(measurements.hasDetailedMeasurements())
                .bmi(measurements.calculateBMI())
                .bmiCategory(measurements.getBMICategory())
                .build();
    }
}
