package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "size_variants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SizeVariant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "size_variant_id")
    private Long sizeVariantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "size_label", nullable = false, length = 20)
    private String sizeLabel;
    
    @Column(name = "size_value", length = 50)
    private String sizeValue;
    
    @Column(name = "sku", unique = true, length = 100)
    private String sku;
    
    @Column(name = "additional_price")
    @Builder.Default
    private Integer additionalPrice = 0;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "sizeVariant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Inventory> inventories;
    
    // 재고 상태 계산 메서드
    public boolean isInStock() {
        return inventories != null && 
               inventories.stream()
                   .anyMatch(inv -> inv.getStockQuantity() > 0);
    }
    
    // 총 재고 수량 계산
    public int getTotalStock() {
        return inventories != null ? 
               inventories.stream()
                   .mapToInt(Inventory::getStockQuantity)
                   .sum() : 0;
    }
    
    // 예약 가능한 재고 수량 계산
    public int getAvailableStock() {
        return inventories != null ? 
               inventories.stream()
                   .mapToInt(inv -> inv.getStockQuantity() - inv.getReservedQuantity())
                   .sum() : 0;
    }
}
