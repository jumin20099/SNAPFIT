package com.snapfit.api.repository;

import com.snapfit.api.entity.SizeChart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SizeChartRepository extends JpaRepository<SizeChart, Long> {
    
    // 스코프 타입별 차트 조회
    List<SizeChart> findByScopeType(SizeChart.ScopeType scopeType);
    
    // 스코프 타입과 값으로 차트 조회
    Optional<SizeChart> findByScopeTypeAndScopeValue(SizeChart.ScopeType scopeType, String scopeValue);
    
    // 기본 차트 조회
    List<SizeChart> findByIsDefaultTrue();
    
    // 특정 스코프 타입의 기본 차트 조회
    Optional<SizeChart> findByScopeTypeAndIsDefaultTrue(SizeChart.ScopeType scopeType);
    
    // 차트 이름으로 검색
    List<SizeChart> findByChartNameContainingIgnoreCase(String chartName);
    
    // 상품에 적용 가능한 차트 조회
    @Query("SELECT sc FROM SizeChart sc WHERE " +
           "(sc.scopeType = 'BRAND' AND sc.scopeValue = :brandName) OR " +
           "(sc.scopeType = 'CATEGORY' AND (sc.scopeValue = :majorCategory OR sc.scopeValue = :subCategory)) OR " +
           "(sc.scopeType = 'PRODUCT' AND sc.scopeValue = :productId) OR " +
           "(sc.isDefault = true AND sc.scopeType = 'CATEGORY') " +
           "ORDER BY " +
           "CASE WHEN sc.scopeType = 'PRODUCT' THEN 1 " +
           "     WHEN sc.scopeType = 'BRAND' THEN 2 " +
           "     WHEN sc.scopeType = 'CATEGORY' AND sc.scopeValue = :subCategory THEN 3 " +
           "     WHEN sc.scopeType = 'CATEGORY' AND sc.scopeValue = :majorCategory THEN 4 " +
           "     ELSE 5 END")
    List<SizeChart> findApplicableCharts(@Param("brandName") String brandName,
                                        @Param("majorCategory") String majorCategory,
                                        @Param("subCategory") String subCategory,
                                        @Param("productId") String productId);
    
    // 카테고리별 기본 차트 조회
    @Query("SELECT sc FROM SizeChart sc WHERE " +
           "sc.scopeType = 'CATEGORY' AND " +
           "(sc.scopeValue = :category OR sc.isDefault = true) " +
           "ORDER BY sc.isDefault ASC")
    List<SizeChart> findByCategory(@Param("category") String category);
    
    // 브랜드별 차트 조회 (기본 차트 포함)
    @Query("SELECT sc FROM SizeChart sc WHERE " +
           "(sc.scopeType = 'BRAND' AND sc.scopeValue = :brandName) OR " +
           "(sc.scopeType = 'CATEGORY' AND sc.isDefault = true) " +
           "ORDER BY sc.scopeType ASC")
    List<SizeChart> findByBrand(@Param("brandName") String brandName);
    
    // 활성화된 차트만 조회
    @Query("SELECT sc FROM SizeChart sc WHERE sc.isDefault = true OR sc.scopeValue IS NOT NULL")
    List<SizeChart> findActiveCharts();
}
