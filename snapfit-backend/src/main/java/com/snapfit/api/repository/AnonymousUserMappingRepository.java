package com.snapfit.api.repository;

import com.snapfit.api.entity.AnonymousUserMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnonymousUserMappingRepository extends JpaRepository<AnonymousUserMapping, Long> {
    
    /**
     * 특정 게시글에서 사용자 식별자로 익명 인덱스 조회
     */
    Optional<AnonymousUserMapping> findByPostIdAndUserIdentifier(Long postId, String userIdentifier);
    
    /**
     * 특정 게시글의 다음 익명 인덱스 번호 조회
     */
    @Query("SELECT COALESCE(MAX(a.anonymousIndex), 0) + 1 FROM AnonymousUserMapping a WHERE a.postId = :postId")
    Integer getNextAnonymousIndex(@Param("postId") Long postId);
    
    /**
     * 특정 게시글의 익명 사용자 수 조회
     */
    @Query("SELECT COUNT(a) FROM AnonymousUserMapping a WHERE a.postId = :postId")
    Long countByPostId(@Param("postId") Long postId);
}
