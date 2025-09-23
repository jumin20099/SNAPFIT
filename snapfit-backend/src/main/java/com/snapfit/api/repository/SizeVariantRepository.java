package com.snapfit.api.repository;

import com.snapfit.api.entity.SizeVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SizeVariantRepository extends JpaRepository<SizeVariant, Long> {
    
    // 상품별 활성화된 사이즈 변형 조회
    @Query("SELECT sv FROM SizeVariant sv WHERE sv.product.productIdx = :productId AND sv.isActive = true ORDER BY sv.sortOrder, sv.sizeLabel")
    List<SizeVariant> findByProductIdAndActiveTrueOrderBySortOrder(@Param("productId") Long productId);
    
    // 상품별 모든 사이즈 변형 조회 (관리자용)
    @Query("SELECT sv FROM SizeVariant sv WHERE sv.product.productIdx = :productId ORDER BY sv.sortOrder, sv.sizeLabel")
    List<SizeVariant> findByProductIdOrderBySortOrder(@Param("productId") Long productId);
    
    // SKU로 사이즈 변형 조회
    Optional<SizeVariant> findBySku(String sku);
    
    // 상품별 특정 사이즈 라벨 조회
    @Query("SELECT sv FROM SizeVariant sv WHERE sv.product.productIdx = :productId AND sv.sizeLabel = :sizeLabel AND sv.isActive = true")
    Optional<SizeVariant> findByProductIdAndSizeLabel(@Param("productId") Long productId, @Param("sizeLabel") String sizeLabel);
    
    // 재고가 있는 사이즈 변형만 조회
    @Query("SELECT DISTINCT sv FROM SizeVariant sv " +
           "LEFT JOIN sv.inventories inv " +
           "WHERE sv.product.productIdx = :productId " +
           "AND sv.isActive = true " +
           "AND (inv.stockQuantity > inv.reservedQuantity) " +
           "ORDER BY sv.sortOrder, sv.sizeLabel")
    List<SizeVariant> findInStockByProductId(@Param("productId") Long productId);
    
    // 재고 부족 사이즈 변형 조회 (관리자용)
    @Query("SELECT sv FROM SizeVariant sv " +
           "LEFT JOIN sv.inventories inv " +
           "WHERE sv.product.productIdx = :productId " +
           "AND sv.isActive = true " +
           "AND (inv.stockQuantity <= inv.safetyStock) " +
           "ORDER BY sv.sortOrder, sv.sizeLabel")
    List<SizeVariant> findLowStockByProductId(@Param("productId") Long productId);
    
    // 카테고리별 사이즈 변형 조회
    @Query("SELECT sv FROM SizeVariant sv " +
           "WHERE sv.product.majorCategory = :category " +
           "AND sv.isActive = true " +
           "ORDER BY sv.product.productIdx, sv.sortOrder")
    List<SizeVariant> findByCategory(@Param("category") String category);
    
    // 브랜드별 사이즈 변형 조회 (현재 지원하지 않음 - Product에 storeName 필드 없음)
    // @Query("SELECT sv FROM SizeVariant sv " +
    //        "WHERE sv.product.storeName = :brand " +
    //        "AND sv.isActive = true " +
    //        "ORDER BY sv.product.productIdx, sv.sortOrder")
    // List<SizeVariant> findByBrand(@Param("brand") String brand);
}
