package com.snapfit.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerDashboardDto {
    
    private String applicationStatus;
    private Integer totalProducts;
    private Integer approvedProducts;
    private Integer pendingProducts;
    private Integer rejectedProducts;
    private Integer monthlyRevenue;
    private List<ActivityDto> recentActivities;

    // 조회수 합계(제휴사용 노출)
    private Long totalViewCount;       // 누적 조회수 합계
    private Long totalActualViewCount; // 실제 조회수(12h) 합계

    // 상품별 조회수 목록
    private java.util.List<ProductView> productViews;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductView {
        private Long productId;
        private String productName;
        private Long viewCount;
        private Long actualViewCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityDto {
        private Long id;
        private String type;
        private String description;
        private String date;
    }
} 