package com.snapfit.api.repository;

import com.snapfit.api.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 신고 리포지토리
 * 
 * @author SnapFit Team
 * @version 1.0
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * 특정 사용자의 신고 목록 조회
     */
    @Query("SELECT r FROM Report r WHERE r.reporterId = :reporterId ORDER BY r.createdAt DESC")
    List<Report> findByReporterId(@Param("reporterId") UUID reporterId);

    /**
     * 특정 사용자의 신고 목록 (페이징)
     */
    @Query("SELECT r FROM Report r WHERE r.reporterId = :reporterId ORDER BY r.createdAt DESC")
    Page<Report> findByReporterIdOrderByCreatedAtDesc(@Param("reporterId") UUID reporterId, Pageable pageable);

    /**
     * 상태별 신고 목록 조회
     */
    @Query("SELECT r FROM Report r WHERE r.status = :status ORDER BY r.createdAt DESC")
    Page<Report> findByStatusOrderByCreatedAtDesc(@Param("status") Report.Status status, Pageable pageable);

    /**
     * 대상 타입별 신고 목록 조회
     */
    @Query("SELECT r FROM Report r WHERE r.targetType = :targetType ORDER BY r.createdAt DESC")
    Page<Report> findByTargetTypeOrderByCreatedAtDesc(@Param("targetType") Report.TargetType targetType, Pageable pageable);

    /**
     * 특정 대상에 대한 신고 목록 조회
     */
    @Query("SELECT r FROM Report r WHERE r.targetType = :targetType AND r.targetId = :targetId ORDER BY r.createdAt DESC")
    List<Report> findByTargetTypeAndTargetId(@Param("targetType") Report.TargetType targetType, @Param("targetId") Long targetId);

    /**
     * 전체 신고 목록 (관리자용)
     */
    @Query("SELECT r FROM Report r ORDER BY r.createdAt DESC")
    Page<Report> findAllOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 처리 대기 중인 신고 수
     */
    long countByStatus(Report.Status status);

    /**
     * 특정 사용자가 특정 대상을 이미 신고했는지 확인
     */
    boolean existsByReporterIdAndTargetTypeAndTargetId(UUID reporterId, Report.TargetType targetType, Long targetId);

    /**
     * 특정 사용자가 특정 사용자(targetUserId)를 신고했는지 확인
     */
    boolean existsByReporterIdAndTargetTypeAndTargetUserId(UUID reporterId, Report.TargetType targetType, UUID targetUserId);

    /**
     * 상태별 신고 통계
     */
    @Query("SELECT r.status, COUNT(r) FROM Report r GROUP BY r.status")
    List<Object[]> getStatusStatistics();

    /**
     * 대상 타입별 신고 통계
     */
    @Query("SELECT r.targetType, COUNT(r) FROM Report r GROUP BY r.targetType")
    List<Object[]> getTargetTypeStatistics();

    /**
     * 신고 카테고리 통계
     */
    @Query("SELECT r.category, COUNT(r) FROM Report r GROUP BY r.category")
    List<Object[]> getCategoryStatistics();

    /**
     * 전체 신고 목록 조회 (생성일 역순)
     */
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 최근 N일간의 신고 수
     */
    @Query(value = "SELECT DATE(created_at), COUNT(*) FROM reports " +
           "WHERE created_at >= CURRENT_DATE - MAKE_INTERVAL(days => ?1) " +
           "GROUP BY DATE(created_at) ORDER BY DATE(created_at)",
           nativeQuery = true)
    List<Object[]> getRecentReportsCount(@Param("days") int days);

    /**
     * 게시글 신고 목록
     */
    @Query("SELECT r FROM Report r WHERE r.targetType = 'POST' AND r.targetId = :postId ORDER BY r.createdAt DESC")
    List<Report> findPostReports(@Param("postId") Long postId);

    /**
     * 댓글 신고 목록
     */
    @Query("SELECT r FROM Report r WHERE r.targetType = 'COMMENT' AND r.targetId = :commentId ORDER BY r.createdAt DESC")
    List<Report> findCommentReports(@Param("commentId") Long commentId);

    /**
     * 사용자 신고 목록 (대상이 사용자인 경우)
     */
    @Query("SELECT r FROM Report r WHERE r.targetType = 'USER' ORDER BY r.createdAt DESC")
    List<Report> findUserReports();
}
