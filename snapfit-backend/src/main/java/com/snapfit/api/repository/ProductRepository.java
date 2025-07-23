package com.snapfit.api.repository;

import com.snapfit.api.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStoreIdx(Long storeIdx);

    List<Product> findByMajorCategoryIgnoreCaseAndIsActiveTrue(String majorCategory);

    List<Product> findByMajorCategoryIgnoreCaseAndSubCategoryIgnoreCaseAndIsActiveTrue(String majorCategory, String subCategory);

    List<Product> findByIsActiveTrue();
}