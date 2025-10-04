package com.snapfit.api.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.Like.TargetType;
import com.snapfit.api.entity.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserAndTargetIdxAndTargetType(User user, Long targetIdx, TargetType targetType);

    Optional<Like> findByGuestIdxAndTargetIdxAndTargetType(String guestIdx, Long targetIdx, TargetType targetType);

    Long countByTargetIdxAndTargetTypeAndIsLikeTrue(Long targetIdx, TargetType targetType);

    List<Like> findByUserAndIsLikeTrue(User user);
    
    /**
     * 특정 사용자의 특정 게시글 좋아요 여부 확인
     * 성능: 복합 인덱스 활용
     */
    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Like l WHERE l.user.userIdx = :userId AND l.targetIdx = :postId AND l.targetType = 'POST'")
    boolean existsByUserIdAndPostId(@Param("userId") UUID userId, @Param("postId") Long postId);
    
    /**
     * 특정 사용자의 특정 타겟 좋아요 여부 확인
     */
    boolean existsByUserUserIdxAndTargetIdxAndTargetType(UUID userIdx, Long targetIdx, TargetType targetType);

    boolean existsByGuestIdxAndTargetIdxAndTargetType(String guestIdx, Long targetIdx, TargetType targetType);
    
    /**
     * 특정 타겟의 좋아요 개수 조회
     */
    long countByTargetIdxAndTargetType(Long targetIdx, TargetType targetType);
    
    /**
     * 특정 타겟의 추천/비추천 개수 조회 (isLike 필터)
     */
    @Query("SELECT COUNT(l) FROM Like l WHERE l.targetIdx = :targetIdx AND l.targetType = :targetType AND l.isLike = :isLike")
    long countByTargetIdxAndTargetTypeAndIsLikeValue(@Param("targetIdx") Long targetIdx, @Param("targetType") TargetType targetType, @Param("isLike") Boolean isLike);
    
    /**
     * 특정 사용자의 특정 타겟에 대한 추천/비추천 삭제
     */
    void deleteByUserAndTargetIdxAndTargetType(User user, Long targetIdx, TargetType targetType);
    
    /**
     * 특정 게스트의 특정 타겟에 대한 추천/비추천 삭제
     */
    void deleteByGuestIdxAndTargetIdxAndTargetType(String guestIdx, Long targetIdx, TargetType targetType);
} 
