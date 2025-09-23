package com.snapfit.api.dto;

import com.snapfit.api.entity.SizeVariant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SizeVariantDto {
    
    private Long sizeVariantId;
    private Long productId;
    private String sizeLabel;
    private String sizeValue;
    private String sku;
    private Integer additionalPrice;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 재고 정보
    private Integer totalStock;
    private Integer availableStock;
    private Boolean inStock;
    private Boolean lowStock;
    
    // 재고 상세 정보
    private List<InventoryDto> inventories;
    
    public static SizeVariantDto from(SizeVariant sizeVariant) {
        if (sizeVariant == null) return null;
        
        return SizeVariantDto.builder()
                .sizeVariantId(sizeVariant.getSizeVariantId())
                .productId(sizeVariant.getProduct().getProductIdx())
                .sizeLabel(sizeVariant.getSizeLabel())
                .sizeValue(sizeVariant.getSizeValue())
                .sku(sizeVariant.getSku())
                .additionalPrice(sizeVariant.getAdditionalPrice())
                .isActive(sizeVariant.getIsActive())
                .sortOrder(sizeVariant.getSortOrder())
                .createdAt(sizeVariant.getCreatedAt())
                .updatedAt(sizeVariant.getUpdatedAt())
                .totalStock(sizeVariant.getTotalStock())
                .availableStock(sizeVariant.getAvailableStock())
                .inStock(sizeVariant.isInStock())
                .lowStock(sizeVariant.getInventories() != null && 
                         sizeVariant.getInventories().stream().anyMatch(inv -> inv.isLowStock()))
                .inventories(sizeVariant.getInventories() != null ? 
                           sizeVariant.getInventories().stream()
                               .map(InventoryDto::from)
                               .collect(Collectors.toList()) : null)
                .build();
    }
    
    // 간단한 사이즈 정보만 포함하는 DTO
    public static SizeVariantDto simple(SizeVariant sizeVariant) {
        if (sizeVariant == null) return null;
        
        return SizeVariantDto.builder()
                .sizeVariantId(sizeVariant.getSizeVariantId())
                .sizeLabel(sizeVariant.getSizeLabel())
                .sizeValue(sizeVariant.getSizeValue())
                .additionalPrice(sizeVariant.getAdditionalPrice())
                .isActive(sizeVariant.getIsActive())
                .totalStock(sizeVariant.getTotalStock())
                .availableStock(sizeVariant.getAvailableStock())
                .inStock(sizeVariant.isInStock())
                .build();
    }
}
