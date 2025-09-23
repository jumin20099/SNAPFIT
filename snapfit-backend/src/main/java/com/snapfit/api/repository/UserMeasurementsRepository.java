package com.snapfit.api.repository;

import com.snapfit.api.entity.UserMeasurements;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserMeasurementsRepository extends JpaRepository<UserMeasurements, UUID> {
    
    // 사용자별 실측 데이터 조회
    Optional<UserMeasurements> findByUserId(UUID userId);
    
    // 공개된 실측 데이터 조회 (통계용)
    @Query("SELECT um FROM UserMeasurements um WHERE um.isPublic = true")
    List<UserMeasurements> findPublicMeasurements();
    
    // 완성도가 높은 실측 데이터 조회
    @Query("SELECT um FROM UserMeasurements um WHERE " +
           "um.heightCm IS NOT NULL AND um.weightKg IS NOT NULL AND " +
           "um.chestCm IS NOT NULL AND um.waistCm IS NOT NULL AND " +
           "um.hipCm IS NOT NULL")
    List<UserMeasurements> findCompleteMeasurements();
    
    // 특정 키 범위의 실측 데이터 조회
    @Query("SELECT um FROM UserMeasurements um WHERE " +
           "um.heightCm BETWEEN :minHeight AND :maxHeight")
    List<UserMeasurements> findByHeightRange(@Param("minHeight") Integer minHeight, 
                                           @Param("maxHeight") Integer maxHeight);
    
    // 특정 몸무게 범위의 실측 데이터 조회
    @Query("SELECT um FROM UserMeasurements um WHERE " +
           "um.weightKg BETWEEN :minWeight AND :maxWeight")
    List<UserMeasurements> findByWeightRange(@Param("minWeight") Double minWeight, 
                                           @Param("maxWeight") Double maxWeight);
    
    // BMI 범위별 실측 데이터 조회
    @Query("SELECT um FROM UserMeasurements um WHERE " +
           "um.heightCm IS NOT NULL AND um.weightKg IS NOT NULL AND " +
           "(um.weightKg / POWER(um.heightCm / 100.0, 2)) BETWEEN :minBMI AND :maxBMI")
    List<UserMeasurements> findByBMIRange(@Param("minBMI") Double minBMI, 
                                        @Param("maxBMI") Double maxBMI);
    
    // 가슴둘레 범위별 실측 데이터 조회
    @Query("SELECT um FROM UserMeasurements um WHERE " +
           "um.chestCm BETWEEN :minChest AND :maxChest")
    List<UserMeasurements> findByChestRange(@Param("minChest") Integer minChest, 
                                          @Param("maxChest") Integer maxChest);
    
    // 허리둘레 범위별 실측 데이터 조회
    @Query("SELECT um FROM UserMeasurements um WHERE " +
           "um.waistCm BETWEEN :minWaist AND :maxWaist")
    List<UserMeasurements> findByWaistRange(@Param("minWaist") Integer minWaist, 
                                          @Param("maxWaist") Integer maxWaist);
    
    // 실측 데이터 통계 조회
    @Query("SELECT " +
           "AVG(um.heightCm) as avgHeight, " +
           "AVG(um.weightKg) as avgWeight, " +
           "AVG(um.chestCm) as avgChest, " +
           "AVG(um.waistCm) as avgWaist, " +
           "AVG(um.hipCm) as avgHip, " +
           "COUNT(um) as totalCount " +
           "FROM UserMeasurements um " +
           "WHERE um.heightCm IS NOT NULL AND um.weightKg IS NOT NULL")
    Object[] getMeasurementStatistics();
    
    // 최근 업데이트된 실측 데이터 조회
    @Query("SELECT um FROM UserMeasurements um ORDER BY um.updatedAt DESC")
    List<UserMeasurements> findRecentlyUpdated();
    
    // 특정 기간 내 업데이트된 실측 데이터 조회
    @Query("SELECT um FROM UserMeasurements um WHERE " +
           "um.updatedAt >= :startDate AND um.updatedAt <= :endDate " +
           "ORDER BY um.updatedAt DESC")
    List<UserMeasurements> findByUpdateDateRange(@Param("startDate") java.time.LocalDateTime startDate,
                                                @Param("endDate") java.time.LocalDateTime endDate);
}
