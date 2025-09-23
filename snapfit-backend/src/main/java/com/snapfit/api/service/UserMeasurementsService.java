package com.snapfit.api.service;

import com.snapfit.api.dto.UserMeasurementsDto;
import com.snapfit.api.entity.User;
import com.snapfit.api.entity.UserMeasurements;
import com.snapfit.api.repository.UserMeasurementsRepository;
import com.snapfit.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserMeasurementsService {
    
    private final UserMeasurementsRepository measurementsRepository;
    private final UserRepository userRepository;
    
    /**
     * 사용자 실측 데이터 조회
     */
    public Optional<UserMeasurementsDto> getMeasurements(UUID userId) {
        log.info("사용자 {}의 실측 데이터 조회", userId);
        
        return measurementsRepository.findByUserId(userId)
                .map(UserMeasurementsDto::from);
    }
    
    /**
     * 사용자 실측 데이터 저장/수정
     */
    @Transactional
    public UserMeasurementsDto saveMeasurements(UUID userId, UserMeasurementsDto measurementsDto) {
        log.info("사용자 {}의 실측 데이터 저장/수정", userId);
        
        // 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 기존 실측 데이터 조회
        Optional<UserMeasurements> existingMeasurements = measurementsRepository.findByUserId(userId);
        
        UserMeasurements measurements;
        if (existingMeasurements.isPresent()) {
            // 기존 데이터 수정
            measurements = existingMeasurements.get();
            updateMeasurementsFields(measurements, measurementsDto);
        } else {
            // 새 데이터 생성
            measurements = createNewMeasurements(userId, measurementsDto);
        }
        
        UserMeasurements savedMeasurements = measurementsRepository.save(measurements);
        log.info("실측 데이터 저장 완료: 사용자 {}", userId);
        
        return UserMeasurementsDto.from(savedMeasurements);
    }
    
    /**
     * 사용자 실측 데이터 삭제
     */
    @Transactional
    public void deleteMeasurements(UUID userId) {
        log.info("사용자 {}의 실측 데이터 삭제", userId);
        
        measurementsRepository.deleteById(userId);
        log.info("실측 데이터 삭제 완료: 사용자 {}", userId);
    }
    
    /**
     * 공개된 실측 데이터 조회 (통계용)
     */
    public List<UserMeasurementsDto> getPublicMeasurements() {
        log.info("공개된 실측 데이터 조회");
        
        return measurementsRepository.findPublicMeasurements().stream()
                .map(UserMeasurementsDto::simple)
                .collect(Collectors.toList());
    }
    
    /**
     * 완성도가 높은 실측 데이터 조회
     */
    public List<UserMeasurementsDto> getCompleteMeasurements() {
        log.info("완성도가 높은 실측 데이터 조회");
        
        return measurementsRepository.findCompleteMeasurements().stream()
                .map(UserMeasurementsDto::summary)
                .collect(Collectors.toList());
    }
    
    /**
     * 실측 데이터 통계 조회
     */
    public Object[] getMeasurementStatistics() {
        log.info("실측 데이터 통계 조회");
        
        return measurementsRepository.getMeasurementStatistics();
    }
    
    /**
     * 사용자 실측 데이터 완성도 조회
     */
    public Integer getCompletionPercentage(UUID userId) {
        log.info("사용자 {}의 실측 데이터 완성도 조회", userId);
        
        return measurementsRepository.findByUserId(userId)
                .map(UserMeasurements::getCompletionPercentage)
                .orElse(0);
    }
    
    /**
     * 기본 실측 데이터 존재 여부 확인
     */
    public boolean hasBasicMeasurements(UUID userId) {
        log.info("사용자 {}의 기본 실측 데이터 존재 여부 확인", userId);
        
        return measurementsRepository.findByUserId(userId)
                .map(UserMeasurements::hasBasicMeasurements)
                .orElse(false);
    }
    
    /**
     * 상세 실측 데이터 존재 여부 확인
     */
    public boolean hasDetailedMeasurements(UUID userId) {
        log.info("사용자 {}의 상세 실측 데이터 존재 여부 확인", userId);
        
        return measurementsRepository.findByUserId(userId)
                .map(UserMeasurements::hasDetailedMeasurements)
                .orElse(false);
    }
    
    /**
     * 새 실측 데이터 생성
     */
    private UserMeasurements createNewMeasurements(UUID userId, UserMeasurementsDto dto) {
        return UserMeasurements.builder()
                .userId(userId)
                .heightCm(dto.getHeightCm())
                .weightKg(dto.getWeightKg())
                .chestCm(dto.getChestCm())
                .waistCm(dto.getWaistCm())
                .hipCm(dto.getHipCm())
                .shoulderCm(dto.getShoulderCm())
                .armLengthCm(dto.getArmLengthCm())
                .legLengthCm(dto.getLegLengthCm())
                .footLengthCm(dto.getFootLengthCm())
                .footWidthCm(dto.getFootWidthCm())
                .neckCm(dto.getNeckCm())
                .thighCm(dto.getThighCm())
                .calfCm(dto.getCalfCm())
                .wristCm(dto.getWristCm())
                .ankleCm(dto.getAnkleCm())
                .isPublic(dto.getIsPublic() != null ? dto.getIsPublic() : false)
                .build();
    }
    
    /**
     * 기존 실측 데이터 필드 업데이트
     */
    private void updateMeasurementsFields(UserMeasurements measurements, UserMeasurementsDto dto) {
        if (dto.getHeightCm() != null) measurements.setHeightCm(dto.getHeightCm());
        if (dto.getWeightKg() != null) measurements.setWeightKg(dto.getWeightKg());
        if (dto.getChestCm() != null) measurements.setChestCm(dto.getChestCm());
        if (dto.getWaistCm() != null) measurements.setWaistCm(dto.getWaistCm());
        if (dto.getHipCm() != null) measurements.setHipCm(dto.getHipCm());
        if (dto.getShoulderCm() != null) measurements.setShoulderCm(dto.getShoulderCm());
        if (dto.getArmLengthCm() != null) measurements.setArmLengthCm(dto.getArmLengthCm());
        if (dto.getLegLengthCm() != null) measurements.setLegLengthCm(dto.getLegLengthCm());
        if (dto.getFootLengthCm() != null) measurements.setFootLengthCm(dto.getFootLengthCm());
        if (dto.getFootWidthCm() != null) measurements.setFootWidthCm(dto.getFootWidthCm());
        if (dto.getNeckCm() != null) measurements.setNeckCm(dto.getNeckCm());
        if (dto.getThighCm() != null) measurements.setThighCm(dto.getThighCm());
        if (dto.getCalfCm() != null) measurements.setCalfCm(dto.getCalfCm());
        if (dto.getWristCm() != null) measurements.setWristCm(dto.getWristCm());
        if (dto.getAnkleCm() != null) measurements.setAnkleCm(dto.getAnkleCm());
        if (dto.getIsPublic() != null) measurements.setIsPublic(dto.getIsPublic());
    }
}
