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