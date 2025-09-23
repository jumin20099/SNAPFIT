package com.snapfit.api.dto;

import com.snapfit.api.entity.SizeChart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SizeChartDto {
    
    private Long sizeChartId;
    private String chartName;
    private String scopeType;
    private String scopeValue;
    private String chartData; // JSON 문자열
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static SizeChartDto from(SizeChart sizeChart) {
        if (sizeChart == null) return null;
        
        return SizeChartDto.builder()
                .sizeChartId(sizeChart.getSizeChartId())
                .chartName(sizeChart.getChartName())
                .scopeType(sizeChart.getScopeType().name())
                .scopeValue(sizeChart.getScopeValue())
                .chartData(sizeChart.getChartData())
                .isDefault(sizeChart.getIsDefault())
                .createdAt(sizeChart.getCreatedAt())
                .updatedAt(sizeChart.getUpdatedAt())
                .build();
    }
}
