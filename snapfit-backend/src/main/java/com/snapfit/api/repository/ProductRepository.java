package com.snapfit.api.repository;

import com.snapfit.api.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStoreIdx(Long storeIdx);

    List<Product> findByMajorCategoryAndIsActiveTrue(String majorCategory);

    List<Product> findByMajorCategoryAndSubCategoryAndIsActiveTrue(String majorCategory, String subCategory);

    List<Product> findByIsActiveTrue();

    // 상품명으로 검색
    List<Product> findByProductNameContainingIgnoreCaseAndIsActiveTrue(String productName);

    // 상품 설명으로 검색
    List<Product> findByProductContentContainingIgnoreCaseAndIsActiveTrue(String productContent);

    // 메이저 카테고리로 검색
    List<Product> findByMajorCategoryContainingIgnoreCaseAndIsActiveTrue(String majorCategory);

    // 서브 카테고리로 검색
    List<Product> findBySubCategoryContainingIgnoreCaseAndIsActiveTrue(String subCategory);

    // 제휴사 이름으로 검색 (JOIN 필요)
    @Query("SELECT p FROM Product p JOIN Store s ON p.storeIdx = s.storeIdx WHERE LOWER(s.storeName) LIKE LOWER(CONCAT('%', :storeName, '%')) AND p.isActive = true")
    List<Product> findByStoreNameContainingIgnoreCaseAndIsActiveTrue(@Param("storeName") String storeName);

    // 통합 검색 (모든 필드에서 검색)
    @Query("SELECT p FROM Product p LEFT JOIN Store s ON p.storeIdx = s.storeIdx " +
           "WHERE (LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.productContent) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.majorCategory) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.subCategory) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.storeName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND p.isActive = true")
    List<Product> searchProductsByKeyword(@Param("keyword") String keyword);
}