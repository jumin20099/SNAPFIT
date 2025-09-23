package com.snapfit.api.repository;

import com.snapfit.api.entity.Inventory;
import com.snapfit.api.entity.SizeVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    // 사이즈 변형별 재고 조회
    List<Inventory> findBySizeVariant(SizeVariant sizeVariant);
    
    // 사이즈 변형 ID로 재고 조회
    @Query("SELECT inv FROM Inventory inv WHERE inv.sizeVariant.sizeVariantId = :sizeVariantId")
    Optional<Inventory> findBySizeVariantId(@Param("sizeVariantId") Long sizeVariantId);
    
    // 상품별 모든 재고 조회
    @Query("SELECT inv FROM Inventory inv " +
           "JOIN inv.sizeVariant sv " +
           "WHERE sv.product.productIdx = :productId " +
           "ORDER BY sv.sortOrder, sv.sizeLabel")
    List<Inventory> findByProductId(@Param("productId") Long productId);
    
    // 재고가 있는 재고만 조회
    @Query("SELECT inv FROM Inventory inv " +
           "JOIN inv.sizeVariant sv " +
           "WHERE sv.product.productIdx = :productId " +
           "AND inv.stockQuantity > inv.reservedQuantity " +
           "ORDER BY sv.sortOrder, sv.sizeLabel")
    List<Inventory> findInStockByProductId(@Param("productId") Long productId);
    
    // 재고 부족 재고 조회
    @Query("SELECT inv FROM Inventory inv " +
           "JOIN inv.sizeVariant sv " +
           "WHERE sv.product.productIdx = :productId " +
           "AND inv.stockQuantity <= inv.safetyStock " +
           "ORDER BY sv.sortOrder, sv.sizeLabel")
    List<Inventory> findLowStockByProductId(@Param("productId") Long productId);
    
    // 품절 재고 조회
    @Query("SELECT inv FROM Inventory inv " +
           "JOIN inv.sizeVariant sv " +
           "WHERE sv.product.productIdx = :productId " +
           "AND inv.stockQuantity = 0 " +
           "ORDER BY sv.sortOrder, sv.sizeLabel")
    List<Inventory> findOutOfStockByProductId(@Param("productId") Long productId);
    
    // 전체 재고 부족 상품 조회 (관리자용)
    @Query("SELECT inv FROM Inventory inv " +
           "WHERE inv.stockQuantity <= inv.safetyStock " +
           "ORDER BY inv.sizeVariant.product.productIdx, inv.sizeVariant.sortOrder")
    List<Inventory> findAllLowStock();
    
    // 특정 수량 이하 재고 조회
    @Query("SELECT inv FROM Inventory inv " +
           "WHERE inv.stockQuantity <= :quantity " +
           "ORDER BY inv.stockQuantity ASC")
    List<Inventory> findByStockQuantityLessThanEqual(@Param("quantity") Integer quantity);
    
    // 재고 업데이트를 위한 네이티브 쿼리 (동시성 제어)
    @Query(value = "UPDATE inventories SET stock_quantity = stock_quantity - :quantity, " +
                   "reserved_quantity = reserved_quantity + :quantity " +
                   "WHERE inventory_id = :inventoryId " +
                   "AND stock_quantity >= :quantity + reserved_quantity", 
           nativeQuery = true)
    int reserveStock(@Param("inventoryId") Long inventoryId, @Param("quantity") Integer quantity);
    
    // 예약 해제를 위한 네이티브 쿼리
    @Query(value = "UPDATE inventories SET reserved_quantity = GREATEST(0, reserved_quantity - :quantity), " +
                   "stock_quantity = stock_quantity + :quantity " +
                   "WHERE inventory_id = :inventoryId", 
           nativeQuery = true)
    int releaseReservation(@Param("inventoryId") Long inventoryId, @Param("quantity") Integer quantity);
}
