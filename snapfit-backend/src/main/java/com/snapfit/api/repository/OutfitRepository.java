package com.snapfit.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;

import java.util.List;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, Long> {
    /** 공개 코디 목록 최신순 조회 */
    List<Outfit> findByIsPublicTrueOrderByCreatedAtDesc();
    
    /** 특정 사용자의 코디 목록 최신순 조회 */
    List<Outfit> findByUserOrderByCreatedAtDesc(User user);
    
    /** 특정 상품을 포함한 공개 코디 조회 (URL 패턴 검색) */
    @Query(value = """
        SELECT * FROM outfits o
        WHERE o.is_public = true
          AND o.outfit_item::text LIKE :productIdPattern
        ORDER BY o.created_at DESC
        LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
    List<Outfit> findPublicByContainsProduct(@Param("productIdPattern") String productIdPattern,
                                            @Param("limit") int limit,
                                            @Param("offset") int offset);
} 