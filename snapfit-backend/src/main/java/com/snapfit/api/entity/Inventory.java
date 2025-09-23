package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_variant_id", nullable = false)
    private SizeVariant sizeVariant;
    
    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;
    
    @Column(name = "safety_stock")
    @Builder.Default
    private Integer safetyStock = 0;
    
    @Column(name = "reserved_quantity")
    @Builder.Default
    private Integer reservedQuantity = 0;
    
    @Column(name = "last_restocked_at")
    private LocalDateTime lastRestockedAt;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 재고 상태 확인 메서드
    public boolean isInStock() {
        return stockQuantity > 0;
    }
    
    // 재고 부족 상태 확인
    public boolean isLowStock() {
        return stockQuantity <= safetyStock;
    }
    
    // 예약 가능한 재고 수량
    public int getAvailableQuantity() {
        return Math.max(0, stockQuantity - reservedQuantity);
    }
    
    // 재고 차감 (주문 시 사용)
    public boolean reduceStock(int quantity) {
        if (getAvailableQuantity() >= quantity) {
            this.stockQuantity -= quantity;
            return true;
        }
        return false;
    }
    
    // 재고 복원 (주문 취소 시 사용)
    public void restoreStock(int quantity) {
        this.stockQuantity += quantity;
    }
    
    // 재고 예약 (주문 생성 시 사용)
    public boolean reserveStock(int quantity) {
        if (getAvailableQuantity() >= quantity) {
            this.reservedQuantity += quantity;
            return true;
        }
        return false;
    }
    
    // 예약 해제 (주문 취소 시 사용)
    public void releaseReservation(int quantity) {
        this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
    }
}
