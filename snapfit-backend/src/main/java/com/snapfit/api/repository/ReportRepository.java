package com.snapfit.api.repository;

import com.snapfit.api.entity.Report;
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
 * 신고 리포지토리 인터페이스
 * 보안과 성능을 고려한 커스텀 쿼리 메서드
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * 신고자별 신고 목록 조회 (페이징)
     * 성능: reporter_id 인덱스 활용
     */
    @Query("SELECT r FROM Report r WHERE r.reporter.userIdx = :reporterId ORDER BY r.createdAt DESC")
    Page<Report> findByReporterIdOrderByCreatedAtDesc(@Param("reporterId") UUID reporterId, Pageable pageable);

    /**
     * 신고 상태별 목록 조회 (페이징)
     * 성능: status 인덱스 활용
     */
    @Query("SELECT r FROM Report r WHERE r.status = :status ORDER BY r.createdAt DESC")
    Page<Report> findByStatusOrderByCreatedAtDesc(@Param("status") Report.ReportStatus status, Pageable pageable);

    /**
     * 신고 대상별 목록 조회 (페이징)
     * 성능: 복합 인덱스 활용
     */
    @Query("SELECT r FROM Report r WHERE r.targetType = :targetType AND r.targetId = :targetId ORDER BY r.createdAt DESC")
    Page<Report> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(@Param("targetType") Report.TargetType targetType, 
                                                                @Param("targetId") Long targetId, 
                                                                Pageable pageable);

    /**
     * 대기중인 신고 목록 조회 (페이징)
     * 성능: status 인덱스 활용
     */
    @Query("SELECT r FROM Report r WHERE r.status = 'PENDING' ORDER BY r.createdAt ASC")
    Page<Report> findPendingReportsOrderByCreatedAtAsc(Pageable pageable);

    /**
     * 신고 통계 조회 (전체)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT r.status as reportStatus, COUNT(r) as count " +
           "FROM Report r " +
           "GROUP BY r.status " +
           "ORDER BY count DESC")
    List<Object[]> getReportStatistics();

    /**
     * 신고 통계 조회 (신고자별)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT r.reporter.userIdx as reporterId, COUNT(r) as count " +
           "FROM Report r " +
           "GROUP BY r.reporter.userIdx " +
           "ORDER BY count DESC")
    List<Object[]> getReportStatisticsByReporter();

    /**
     * 신고 통계 조회 (대상 타입별)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT r.targetType as targetType, COUNT(r) as count " +
           "FROM Report r " +
           "GROUP BY r.targetType " +
           "ORDER BY count DESC")
    List<Object[]> getReportStatisticsByTargetType();

    /**
     * 신고 처리 시간 통계 조회
     * 성능: 시간 계산 최적화
     */
    @Query("SELECT r.targetType as targetType, " +
           "COUNT(r) as reportCount " +
           "FROM Report r " +
           "WHERE r.status IN ('RESOLVED', 'REJECTED') AND r.resolvedAt IS NOT NULL " +
           "GROUP BY r.targetType " +
           "ORDER BY reportCount DESC")
    List<Object[]> getReportProcessingTimeStatistics();

    /**
     * 신고 우선순위별 목록 조회 (페이징)
     * 성능: 우선순위 계산 최적화
     */
    @Query("SELECT r FROM Report r ORDER BY " +
           "CASE r.targetType " +
           "  WHEN 'USER' THEN 1 " +
           "  WHEN 'POST' THEN 2 " +
           "  WHEN 'COMMENT' THEN 3 " +
           "  ELSE 4 " +
           "END ASC, r.createdAt ASC")
    Page<Report> findReportsOrderByPriorityAndCreatedAtAsc(Pageable pageable);
}
