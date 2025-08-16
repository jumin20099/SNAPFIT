package com.snapfit.api.repository;

import com.snapfit.api.entity.PartnerProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartnerProductRepository extends JpaRepository<PartnerProduct, Long> {
    
    // 제휴사별 상품 목록 조회
    List<PartnerProduct> findByPartnerApplicationIdOrderByCreatedAtDesc(Long partnerApplicationId);
    
    // 상태별 상품 목록 조회
    List<PartnerProduct> findByStatus(PartnerProduct.ProductStatus status);
    
    // 제휴사별 상태별 상품 목록 조회
    List<PartnerProduct> findByPartnerApplicationIdAndStatus(Long partnerApplicationId, PartnerProduct.ProductStatus status);

    // 상품 총 갯수
    int countByPartnerApplicationId(Long partnerApplicationId);

        // 상태별 상품 갯수
    int countByPartnerApplicationIdAndStatus(Long partnerApplicationId, PartnerProduct.ProductStatus status);
    
    // 수정 요청 상태별 상품 목록 조회
    List<PartnerProduct> findByUpdateRequestStatus(PartnerProduct.UpdateRequestStatus updateRequestStatus);
} 