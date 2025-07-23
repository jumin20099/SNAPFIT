package com.snapfit.api.repository;

import com.snapfit.api.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStoreIdx(Long storeIdx);

    // 카테고리(대소문자 무관) + isActive = true
    List<Product> findByProductCategoryIgnoreCaseAndIsActiveTrue(String productCategory);
}