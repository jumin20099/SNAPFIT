package com.snapfit.api.repository;

import com.snapfit.api.entity.Block;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 차단 리포지토리 인터페이스
 * 보안과 성능을 고려한 커스텀 쿼리 메서드
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Repository
public interface BlockRepository extends JpaRepository<Block, Block.BlockId> {

    /**
     * 차단자별 차단 목록 조회 (페이징)
     * 성능: blocker_id 인덱스 활용
     */
    @Query("SELECT b FROM Block b WHERE b.blocker.userIdx = :blockerId ORDER BY b.createdAt DESC")
    Page<Block> findByBlockerIdOrderByCreatedAtDesc(@Param("blockerId") UUID blockerId, Pageable pageable);

    /**
     * 차단된 사용자별 차단 목록 조회 (페이징)
     * 성능: blocked_user_id 인덱스 활용
     */
    @Query("SELECT b FROM Block b WHERE b.blockedUser.userIdx = :blockedUserId ORDER BY b.createdAt DESC")
    Page<Block> findByBlockedUserIdOrderByCreatedAtDesc(@Param("blockedUserId") UUID blockedUserId, Pageable pageable);

    /**
     * 특정 사용자 간 차단 관계 확인
     * 성능: 복합 기본키 활용
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Block b WHERE b.blocker.userIdx = :blockerId AND b.blockedUser.userIdx = :blockedUserId")
    boolean existsByBlockerIdAndBlockedUserId(@Param("blockerId") UUID blockerId, @Param("blockedUserId") UUID blockedUserId);

    /**
     * 사용자별 차단한 사용자 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(b) FROM Block b WHERE b.blocker.userIdx = :blockerId")
    long countByBlockerId(@Param("blockerId") UUID blockerId);

    /**
     * 사용자별 차단된 사용자 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(b) FROM Block b WHERE b.blockedUser.userIdx = :blockedUserId")
    long countByBlockedUserId(@Param("blockedUserId") UUID blockedUserId);

    /**
     * 차단 통계 조회 (전체)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(b) as totalBlocks, " +
           "COUNT(DISTINCT b.blocker.userIdx) as uniqueBlockers, " +
           "COUNT(DISTINCT b.blockedUser.userIdx) as uniqueBlockedUsers " +
           "FROM Block b")
    Object[] getBlockStatistics();

    /**
     * 차단 통계 조회 (차단자별)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT b.blocker.userIdx as blockerId, COUNT(b) as blockCount " +
           "FROM Block b " +
           "GROUP BY b.blocker.userIdx " +
           "ORDER BY blockCount DESC")
    List<Object[]> getBlockStatisticsByBlocker();

    /**
     * 차단 통계 조회 (차단된 사용자별)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT b.blockedUser.userIdx as blockedUserId, COUNT(b) as blockCount " +
           "FROM Block b " +
           "GROUP BY b.blockedUser.userIdx " +
           "ORDER BY blockCount DESC")
    List<Object[]> getBlockStatisticsByBlockedUser();

    /**
     * 차단 영향도 통계 조회
     * 성능: 차단 기간 계산 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN EXTRACT(EPOCH FROM (NOW() - b.createdAt))/86400 < 1 THEN 'LOW' " +
           "  WHEN EXTRACT(EPOCH FROM (NOW() - b.createdAt))/86400 < 7 THEN 'MEDIUM' " +
           "  WHEN EXTRACT(EPOCH FROM (NOW() - b.createdAt))/86400 < 30 THEN 'HIGH' " +
           "  ELSE 'CRITICAL' " +
           "END as impactLevel, " +
           "COUNT(b) as blockCount " +
           "FROM Block b " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN EXTRACT(EPOCH FROM (NOW() - b.createdAt))/86400 < 1 THEN 'LOW' " +
           "    WHEN EXTRACT(EPOCH FROM (NOW() - b.createdAt))/86400 < 7 THEN 'MEDIUM' " +
           "    WHEN EXTRACT(EPOCH FROM (NOW() - b.createdAt))/86400 < 30 THEN 'HIGH' " +
           "    ELSE 'CRITICAL' " +
           "  END " +
           "ORDER BY blockCount DESC")
    List<Object[]> getBlockImpactStatistics();

    /**
     * 차단 우선순위별 목록 조회 (페이징)
     * 성능: 우선순위 계산 최적화
     */
    @Query("SELECT b FROM Block b ORDER BY " +
           "CASE " +
           "  WHEN b.reason IS NOT NULL AND LENGTH(b.reason) > 0 THEN 1 " +
           "  ELSE 2 " +
           "END ASC, b.createdAt DESC")
    Page<Block> findBlocksOrderByPriorityAndCreatedAtDesc(Pageable pageable);
}
