package com.snapfit.api.repository;

import com.snapfit.api.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // 필요시 커스텀 메서드 추가
}