package com.snapfit.api.repository;

import com.snapfit.api.entity.ProductUpdateRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductUpdateRequestRepository extends JpaRepository<ProductUpdateRequest, Long> {
    
    // 특정 상품의 수정 요청 목록 조회
    List<ProductUpdateRequest> findByPartnerProductIdOrderByCreatedAtDesc(Long partnerProductId);
    
    // 특정 상품의 대기 중인 수정 요청 조회
    Optional<ProductUpdateRequest> findByPartnerProductIdAndUpdateRequestStatus(
        Long partnerProductId, 
        ProductUpdateRequest.UpdateRequestStatus status
    );
    
    // 대기 중인 모든 수정 요청 조회
    List<ProductUpdateRequest> findByUpdateRequestStatusOrderByCreatedAtDesc(
        ProductUpdateRequest.UpdateRequestStatus status
    );
    
    // 특정 상품의 수정 요청 존재 여부 확인
    boolean existsByPartnerProductIdAndUpdateRequestStatus(
        Long partnerProductId, 
        ProductUpdateRequest.UpdateRequestStatus status
    );
    
    // 특정 상품의 수정 요청 개수 조회
    @Query("SELECT COUNT(p) FROM ProductUpdateRequest p WHERE p.partnerProductId = :partnerProductId")
    long countByPartnerProductId(@Param("partnerProductId") Long partnerProductId);
}
