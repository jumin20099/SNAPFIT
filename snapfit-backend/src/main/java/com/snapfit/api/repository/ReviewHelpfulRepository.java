package com.snapfit.api.repository;

import com.snapfit.api.entity.ReviewHelpful;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, Long> {
    
    // 사용자가 특정 리뷰에 도움됨을 눌렀는지 확인
    Optional<ReviewHelpful> findByReviewIdAndUserUserIdx(Long reviewId, UUID userIdx);
    
    // 특정 리뷰의 도움됨 개수 조회
    @Query("SELECT COUNT(rh) FROM ReviewHelpful rh WHERE rh.reviewId = :reviewId")
    Long countByReviewId(@Param("reviewId") Long reviewId);
    
    // 사용자가 특정 리뷰에 도움됨을 눌렀는지 확인 (boolean)
    @Query("SELECT CASE WHEN COUNT(rh) > 0 THEN true ELSE false END FROM ReviewHelpful rh WHERE rh.reviewId = :reviewId AND rh.user.userIdx = :userIdx")
    boolean existsByReviewIdAndUserUserIdx(@Param("reviewId") Long reviewId, @Param("userIdx") UUID userIdx);
    
    // 특정 리뷰의 모든 도움됨 기록 삭제
    void deleteByReviewId(Long reviewId);
}
