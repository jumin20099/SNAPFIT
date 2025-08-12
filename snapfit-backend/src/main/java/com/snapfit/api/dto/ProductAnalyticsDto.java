package com.snapfit.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductAnalyticsDto {
    private Long productId;
    private String productName;
    private Long viewCount;
    private Long actualViewCount;
    // 확장 여지: 구매/매출/전환율 등은 0 또는 별도 집계에서 채움
    private Long purchaseCount;
    private Long totalSales;
    private Double conversionRate;
}


