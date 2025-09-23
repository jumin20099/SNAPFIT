package com.snapfit.api.controller;

import com.snapfit.api.dto.UserMeasurementsDto;
import com.snapfit.api.service.UserMeasurementsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserMeasurementsController {
    
    private final UserMeasurementsService measurementsService;
    
    /**
     * 사용자 실측 데이터 조회
     * GET /api/users/{userId}/measurements
     */
    @GetMapping("/{userId}/measurements")
    public ResponseEntity<UserMeasurementsDto> getMeasurements(@PathVariable String userId) {
        try {
            log.info("사용자 {}의 실측 데이터 조회 요청", userId);
            
            UUID userUuid = UUID.fromString(userId);
            Optional<UserMeasurementsDto> measurements = measurementsService.getMeasurements(userUuid);
            
            if (measurements.isPresent()) {
                log.info("실측 데이터 조회 완료: 사용자 {}", userId);
                return ResponseEntity.ok(measurements.get());
            } else {
                log.info("실측 데이터 없음: 사용자 {}", userId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 사용자 ID: {}", userId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("실측 데이터 조회 실패: 사용자 {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 사용자 실측 데이터 저장/수정
     * POST /api/users/{userId}/measurements
     */
    @PostMapping("/{userId}/measurements")
    public ResponseEntity<UserMeasurementsDto> saveMeasurements(
            @PathVariable String userId,
            @RequestBody UserMeasurementsDto measurementsDto) {
        
        try {
            log.info("사용자 {}의 실측 데이터 저장/수정 요청", userId);
            
            UUID userUuid = UUID.fromString(userId);
            UserMeasurementsDto savedMeasurements = measurementsService.saveMeasurements(userUuid, measurementsDto);
            
            log.info("실측 데이터 저장/수정 완료: 사용자 {}", userId);
            return ResponseEntity.ok(savedMeasurements);
            
        } catch (IllegalArgumentException e) {
            log.warn("실측 데이터 저장/수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("실측 데이터 저장/수정 실패: 사용자 {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 사용자 실측 데이터 삭제
     * DELETE /api/users/{userId}/measurements
     */
    @DeleteMapping("/{userId}/measurements")
    public ResponseEntity<Void> deleteMeasurements(@PathVariable String userId) {
        try {
            log.info("사용자 {}의 실측 데이터 삭제 요청", userId);
            
            UUID userUuid = UUID.fromString(userId);
            measurementsService.deleteMeasurements(userUuid);
            
            log.info("실측 데이터 삭제 완료: 사용자 {}", userId);
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            log.warn("실측 데이터 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("실측 데이터 삭제 실패: 사용자 {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 공개된 실측 데이터 조회 (통계용)
     * GET /api/users/measurements/public
     */
    @GetMapping("/measurements/public")
    public ResponseEntity<List<UserMeasurementsDto>> getPublicMeasurements() {
        try {
            log.info("공개된 실측 데이터 조회 요청");
            
            List<UserMeasurementsDto> publicMeasurements = measurementsService.getPublicMeasurements();
            
            log.info("공개된 실측 데이터 조회 완료: {}개", publicMeasurements.size());
            return ResponseEntity.ok(publicMeasurements);
            
        } catch (Exception e) {
            log.error("공개된 실측 데이터 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 완성도가 높은 실측 데이터 조회
     * GET /api/users/measurements/complete
     */
    @GetMapping("/measurements/complete")
    public ResponseEntity<List<UserMeasurementsDto>> getCompleteMeasurements() {
        try {
            log.info("완성도가 높은 실측 데이터 조회 요청");
            
            List<UserMeasurementsDto> completeMeasurements = measurementsService.getCompleteMeasurements();
            
            log.info("완성도가 높은 실측 데이터 조회 완료: {}개", completeMeasurements.size());
            return ResponseEntity.ok(completeMeasurements);
            
        } catch (Exception e) {
            log.error("완성도가 높은 실측 데이터 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 실측 데이터 통계 조회
     * GET /api/users/measurements/statistics
     */
    @GetMapping("/measurements/statistics")
    public ResponseEntity<Object[]> getMeasurementStatistics() {
        try {
            log.info("실측 데이터 통계 조회 요청");
            
            Object[] statistics = measurementsService.getMeasurementStatistics();
            
            log.info("실측 데이터 통계 조회 완료");
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            log.error("실측 데이터 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 사용자 실측 데이터 완성도 조회
     * GET /api/users/{userId}/measurements/completion
     */
    @GetMapping("/{userId}/measurements/completion")
    public ResponseEntity<Integer> getCompletionPercentage(@PathVariable String userId) {
        try {
            log.info("사용자 {}의 실측 데이터 완성도 조회 요청", userId);
            
            UUID userUuid = UUID.fromString(userId);
            Integer completionPercentage = measurementsService.getCompletionPercentage(userUuid);
            
            log.info("실측 데이터 완성도 조회 완료: 사용자 {} - {}%", userId, completionPercentage);
            return ResponseEntity.ok(completionPercentage);
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 사용자 ID: {}", userId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("실측 데이터 완성도 조회 실패: 사용자 {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 기본 실측 데이터 존재 여부 확인
     * GET /api/users/{userId}/measurements/basic
     */
    @GetMapping("/{userId}/measurements/basic")
    public ResponseEntity<Boolean> hasBasicMeasurements(@PathVariable String userId) {
        try {
            log.info("사용자 {}의 기본 실측 데이터 존재 여부 확인 요청", userId);
            
            UUID userUuid = UUID.fromString(userId);
            boolean hasBasic = measurementsService.hasBasicMeasurements(userUuid);
            
            log.info("기본 실측 데이터 존재 여부 확인 완료: 사용자 {} - {}", userId, hasBasic);
            return ResponseEntity.ok(hasBasic);
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 사용자 ID: {}", userId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("기본 실측 데이터 존재 여부 확인 실패: 사용자 {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
