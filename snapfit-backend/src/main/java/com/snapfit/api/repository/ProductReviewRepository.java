package com.snapfit.api.repository;

import com.snapfit.api.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    
    // 상품별 리뷰 조회 (페이징)
    Page<ProductReview> findByProductIdAndStatusOrderByCreatedAtDesc(
        Long productId, 
        ProductReview.ReviewStatus status, 
        Pageable pageable
    );
    
    // 상품별 리뷰 조회 (평점순)
    Page<ProductReview> findByProductIdAndStatusOrderByRatingDescCreatedAtDesc(
        Long productId, 
        ProductReview.ReviewStatus status, 
        Pageable pageable
    );
    
    // 상품별 리뷰 조회 (도움됨순)
    Page<ProductReview> findByProductIdAndStatusOrderByHelpfulCountDescCreatedAtDesc(
        Long productId, 
        ProductReview.ReviewStatus status, 
        Pageable pageable
    );
    
    // 사용자가 특정 상품에 작성한 리뷰 조회
    Optional<ProductReview> findByProductIdAndUserUserIdxAndStatus(
        Long productId, 
        UUID userIdx, 
        ProductReview.ReviewStatus status
    );
    
    // 사용자가 특정 상품을 구매했는지 확인 (주문 내역 기반)
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.user.userIdx = :userId " +
           "AND oi.product.productIdx = :productId " +
           "AND o.status = 'PAID'")
    boolean hasUserPurchasedProduct(@Param("userId") UUID userId, @Param("productId") Long productId);
    
    // 상품별 리뷰 통계 조회
    @Query("SELECT AVG(r.rating), COUNT(r) FROM ProductReview r " +
           "WHERE r.productId = :productId AND r.status = 'PUBLISHED'")
    Object[] getReviewStatsByProductId(@Param("productId") Long productId);
    
    // 사용자의 리뷰 목록 조회
    Page<ProductReview> findByUserUserIdxAndStatusOrderByCreatedAtDesc(
        UUID userIdx, 
        ProductReview.ReviewStatus status, 
        Pageable pageable
    );
    
    // 신고된 리뷰 조회
    Page<ProductReview> findByIsReportedTrueOrderByCreatedAtDesc(Pageable pageable);
}
