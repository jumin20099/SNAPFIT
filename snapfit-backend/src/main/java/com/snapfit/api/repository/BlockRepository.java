package com.snapfit.api.repository;

import com.snapfit.api.entity.Block;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 차단 리포지토리
 * 
 * @author SnapFit Team
 * @version 1.0
 */
@Repository
public interface BlockRepository extends JpaRepository<Block, Block.BlockId> {

    /**
     * 특정 사용자가 차단한 사용자 목록 조회
     */
    @Query("SELECT b FROM Block b WHERE b.blockerId = :blockerId ORDER BY b.createdAt DESC")
    List<Block> findByBlockerId(@Param("blockerId") UUID blockerId);

    /**
     * 특정 사용자가 차단한 사용자 목록 (페이징)
     */
    @Query("SELECT b FROM Block b WHERE b.blockerId = :blockerId ORDER BY b.createdAt DESC")
    Page<Block> findByBlockerIdOrderByCreatedAtDesc(@Param("blockerId") UUID blockerId, Pageable pageable);

    /**
     * 특정 사용자를 차단한 사용자 목록 조회
     */
    @Query("SELECT b FROM Block b WHERE b.blockedUserId = :blockedUserId ORDER BY b.createdAt DESC")
    List<Block> findByBlockedUserId(@Param("blockedUserId") UUID blockedUserId);

    /**
     * 차단 관계 존재 여부 확인
     */
    boolean existsByBlockerIdAndBlockedUserId(UUID blockerId, UUID blockedUserId);

    /**
     * 특정 사용자가 차단한 사용자들의 ID 목록
     */
    @Query("SELECT b.blockedUserId FROM Block b WHERE b.blockerId = :blockerId")
    List<UUID> findBlockedUserIdsByBlockerId(@Param("blockerId") UUID blockerId);

    /**
     * 특정 사용자들이 차단되어 있는지 확인
     */
    @Query("SELECT b.blockedUserId FROM Block b WHERE b.blockerId = :blockerId AND b.blockedUserId IN :userIds")
    List<UUID> findBlockedUserIdsInList(@Param("blockerId") UUID blockerId, @Param("userIds") List<UUID> userIds);

    /**
     * 차단 해제
     */
    void deleteByBlockerIdAndBlockedUserId(UUID blockerId, UUID blockedUserId);

    /**
     * 특정 사용자의 총 차단 수
     */
    long countByBlockerId(UUID blockerId);

    /**
     * 특정 사용자를 차단한 총 수
     */
    long countByBlockedUserId(UUID blockedUserId);

    /**
     * 서로 차단 여부 확인 (A가 B를 차단했거나 B가 A를 차단한 경우)
     */
    @Query("SELECT COUNT(b) > 0 FROM Block b WHERE " +
           "(b.blockerId = :userId1 AND b.blockedUserId = :userId2) OR " +
           "(b.blockerId = :userId2 AND b.blockedUserId = :userId1)")
    boolean existsMutualBlock(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);
}