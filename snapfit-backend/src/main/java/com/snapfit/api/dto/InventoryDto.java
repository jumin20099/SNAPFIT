package com.snapfit.api.dto;

import com.snapfit.api.entity.Inventory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDto {
    
    private Long inventoryId;
    private Long sizeVariantId;
    private Integer stockQuantity;
    private Integer safetyStock;
    private Integer reservedQuantity;
    private LocalDateTime lastRestockedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 계산된 필드
    private Integer availableQuantity;
    private Boolean inStock;
    private Boolean lowStock;
    private String stockStatus; // "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"
    
    public static InventoryDto from(Inventory inventory) {
        if (inventory == null) return null;
        
        String stockStatus = determineStockStatus(inventory);
        
        return InventoryDto.builder()
                .inventoryId(inventory.getInventoryId())
                .sizeVariantId(inventory.getSizeVariant().getSizeVariantId())
                .stockQuantity(inventory.getStockQuantity())
                .safetyStock(inventory.getSafetyStock())
                .reservedQuantity(inventory.getReservedQuantity())
                .lastRestockedAt(inventory.getLastRestockedAt())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .availableQuantity(inventory.getAvailableQuantity())
                .inStock(inventory.isInStock())
                .lowStock(inventory.isLowStock())
                .stockStatus(stockStatus)
                .build();
    }
    
    private static String determineStockStatus(Inventory inventory) {
        if (inventory.getStockQuantity() == 0) {
            return "OUT_OF_STOCK";
        } else if (inventory.isLowStock()) {
            return "LOW_STOCK";
        } else {
            return "IN_STOCK";
        }
    }
}
