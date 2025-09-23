package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "size_charts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SizeChart {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "size_chart_id")
    private Long sizeChartId;
    
    @Column(name = "chart_name", nullable = false, length = 100)
    private String chartName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "scope_type", nullable = false, length = 20)
    private ScopeType scopeType;
    
    @Column(name = "scope_value", length = 100)
    private String scopeValue;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "chart_data", nullable = false, columnDefinition = "jsonb")
    private String chartData;
    
    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum ScopeType {
        BRAND,      // 브랜드별
        CATEGORY,   // 카테고리별
        PRODUCT     // 상품별
    }
    
    // 차트 데이터 파싱을 위한 헬퍼 메서드들
    public boolean isApplicableToProduct(Product product) {
        if (product == null) return false;
        
        switch (scopeType) {
            case BRAND:
                // 브랜드별 차트는 현재 지원하지 않음 (Product에 storeName 필드 없음)
                return false;
            case CATEGORY:
                return product.getMajorCategory() != null && 
                       product.getMajorCategory().equals(scopeValue);
            case PRODUCT:
                return product.getProductIdx().toString().equals(scopeValue);
            default:
                return false;
        }
    }
    
    public boolean isApplicableToCategory(String majorCategory, String subCategory) {
        if (scopeType != ScopeType.CATEGORY) return false;
        
        if (scopeValue == null) return false;
        
        // 정확한 매칭 또는 하위 카테고리 매칭
        return scopeValue.equals(majorCategory) || 
               (subCategory != null && scopeValue.equals(subCategory));
    }
}
