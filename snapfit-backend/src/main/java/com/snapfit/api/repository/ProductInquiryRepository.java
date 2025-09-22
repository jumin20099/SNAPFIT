package com.snapfit.api.repository;

import com.snapfit.api.entity.ProductInquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductInquiryRepository extends JpaRepository<ProductInquiry, Long> {
    
    // 상품별 문의 조회 (공개 문의만)
    Page<ProductInquiry> findByProductIdAndIsPrivateFalseOrderByCreatedAtDesc(
        Long productId, 
        Pageable pageable
    );
    
    // 상품별 문의 조회 (사용자 본인 + 공개 문의)
    @Query("SELECT i FROM ProductInquiry i WHERE i.productId = :productId " +
           "AND (i.isPrivate = false OR i.user.userIdx = :userId) " +
           "ORDER BY i.createdAt DESC")
    Page<ProductInquiry> findByProductIdAndUserAccessOrderByCreatedAtDesc(
        @Param("productId") Long productId, 
        @Param("userId") UUID userId, 
        Pageable pageable
    );
    
    // 사용자의 문의 목록 조회
    Page<ProductInquiry> findByUserUserIdxOrderByCreatedAtDesc(
        UUID userIdx, 
        Pageable pageable
    );
    
    // 답변 대기 중인 문의 조회 (관리자용)
    Page<ProductInquiry> findByStatusOrderByCreatedAtDesc(
        ProductInquiry.InquiryStatus status, 
        Pageable pageable
    );
    
    // 상품별 문의 통계 조회
    @Query("SELECT " +
           "COUNT(i) as totalInquiries, " +
           "COUNT(CASE WHEN i.status = 'OPEN' THEN 1 END) as openInquiries, " +
           "COUNT(CASE WHEN i.status = 'ANSWERED' THEN 1 END) as answeredInquiries, " +
           "COUNT(CASE WHEN i.status = 'CLOSED' THEN 1 END) as closedInquiries, " +
           "COUNT(CASE WHEN i.isPrivate = true THEN 1 END) as privateInquiries " +
           "FROM ProductInquiry i WHERE i.productId = :productId")
    Object[] getInquiryStatsByProductId(@Param("productId") Long productId);
    
    // 답변한 문의 조회 (관리자용)
    Page<ProductInquiry> findByAnsweredByOrderByAnsweredAtDesc(
        UUID answeredBy, 
        Pageable pageable
    );
    
    // 특정 사용자의 특정 상품 문의 조회
    List<ProductInquiry> findByProductIdAndUserUserIdxOrderByCreatedAtDesc(
        Long productId, 
        UUID userIdx
    );
}
