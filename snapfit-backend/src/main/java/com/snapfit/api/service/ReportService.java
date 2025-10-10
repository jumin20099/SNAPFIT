package com.snapfit.api.service;

import com.snapfit.api.entity.Report;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.ReportRepository;
import com.snapfit.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 신고 서비스
 * 
 * @author SnapFit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    /**
     * 게시글 신고
     */
    @Transactional
    public Report reportPost(UUID reporterId, Long postId, String reason, Report.Category category) {
        log.info("게시글 신고 시작: 신고자={}, 게시글ID={}", reporterId, postId);
        
        // 중복 신고 체크
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
            reporterId, Report.TargetType.POST, postId)) {
            throw new IllegalArgumentException("이미 신고한 게시글입니다");
        }
        
        // 신고자 존재 확인
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new IllegalArgumentException("신고자를 찾을 수 없습니다"));
        
        Report report = Report.createPostReport(reporterId, postId, reason, category);
        Report savedReport = reportRepository.save(report);
        
        log.info("게시글 신고 완료: 신고ID={}, 신고자={}, 게시글ID={}", 
            savedReport.getReportId(), reporterId, postId);
        
        return savedReport;
    }

    /**
     * 댓글 신고
     */
    @Transactional
    public Report reportComment(UUID reporterId, Long commentId, String reason, Report.Category category) {
        log.info("댓글 신고 시작: 신고자={}, 댓글ID={}", reporterId, commentId);
        
        // 중복 신고 체크
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
            reporterId, Report.TargetType.COMMENT, commentId)) {
            throw new IllegalArgumentException("이미 신고한 댓글입니다");
        }
        
        // 신고자 존재 확인
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new IllegalArgumentException("신고자를 찾을 수 없습니다"));
        
        Report report = Report.createCommentReport(reporterId, commentId, reason, category);
        Report savedReport = reportRepository.save(report);
        
        log.info("댓글 신고 완료: 신고ID={}, 신고자={}, 댓글ID={}", 
            savedReport.getReportId(), reporterId, commentId);
        
        return savedReport;
    }

    /**
     * 사용자 신고
     */
    @Transactional
    public Report reportUser(UUID reporterId, UUID targetUserId, String reason, Report.Category category) {
        log.info("사용자 신고 시작: 신고자={}, 대상사용자={}", reporterId, targetUserId);
        
        // 자기 자신 신고 방지
        if (reporterId.equals(targetUserId)) {
            throw new IllegalArgumentException("자기 자신을 신고할 수 없습니다");
        }

        // 대상 사용자 존재 확인
        userRepository.findById(targetUserId)
            .orElseThrow(() -> new IllegalArgumentException("신고할 사용자를 찾을 수 없습니다"));
        
        // 신고자 존재 확인
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new IllegalArgumentException("신고자를 찾을 수 없습니다"));
        
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetUserId(
            reporterId, Report.TargetType.USER, targetUserId)) {
            throw new IllegalArgumentException("이미 신고한 사용자입니다");
        }

        Report report = Report.createUserReport(reporterId, targetUserId, reason, category);
        Report savedReport = reportRepository.save(report);
        
        log.info("사용자 신고 완료: 신고ID={}, 신고자={}, 대상사용자={}", 
            savedReport.getReportId(), reporterId, targetUserId);
        
        return savedReport;
    }

    /**
     * 신고 상태 변경 (관리자용)
     */
    @Transactional
    public Report updateReportStatus(Long reportId, Report.Status status, String adminNotes) {
        log.info("신고 상태 변경 시작: 신고ID={}, 새상태={}", reportId, status);
        
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다"));
        
        if (!report.canBeProcessed()) {
            throw new IllegalArgumentException("처리할 수 없는 신고 상태입니다");
        }
        
        switch (status) {
            case RESOLVED -> report.approve(adminNotes);
            case REJECTED -> report.reject(adminNotes);
            case PROCESSING -> report.startProcessing();
            default -> throw new IllegalArgumentException("지원하지 않는 상태 변경입니다");
        }
        
        Report savedReport = reportRepository.save(report);
        
        log.info("신고 상태 변경 완료: 신고ID={}, 새상태={}", reportId, status);
        
        return savedReport;
    }

    /**
     * 내 신고 목록 조회
     */
    public List<Report> getMyReports(UUID reporterId) {
        return reportRepository.findByReporterId(reporterId);
    }

    /**
     * 내 신고 목록 조회 (페이징)
     */
    public Page<Report> getMyReports(UUID reporterId, Pageable pageable) {
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(reporterId, pageable);
    }

    /**
     * 전체 신고 목록 조회 (관리자용)
     */
    public Page<Report> getAllReports(Pageable pageable) {
        log.info("전체 신고 목록 조회: 페이지={}, 크기={}", pageable.getPageNumber(), pageable.getPageSize());
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * 상태별 신고 목록 조회 (페이징)
     */
    public Page<Report> getReportsByStatus(Report.Status status, Pageable pageable) {
        log.info("상태별 신고 목록 조회: 상태={}, 페이지={}, 크기={}", status, pageable.getPageNumber(), pageable.getPageSize());
        return reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }



    /**
     * 대상 타입별 신고 목록 조회
     */
    public Page<Report> getReportsByTargetType(Report.TargetType targetType, Pageable pageable) {
        return reportRepository.findByTargetTypeOrderByCreatedAtDesc(targetType, pageable);
    }

    /**
     * 특정 게시글에 대한 신고 목록
     */
    public List<Report> getPostReports(Long postId) {
        return reportRepository.findPostReports(postId);
    }

    /**
     * 특정 댓글에 대한 신고 목록
     */
    public List<Report> getCommentReports(Long commentId) {
        return reportRepository.findCommentReports(commentId);
    }

    /**
     * 신고 통계 조회
     */
    public Map<String, Object> getReportStatistics() {
        // 상태별 통계
        List<Object[]> statusStats = reportRepository.getStatusStatistics();
        Map<String, Long> statusCounts = statusStats.stream()
            .collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> (Long) row[1]
            ));
        
        // 타입별 통계
        List<Object[]> typeStats = reportRepository.getTargetTypeStatistics();
        Map<String, Long> typeCounts = typeStats.stream()
            .collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> (Long) row[1]
            ));

        // 카테고리별 통계
        List<Object[]> categoryStats = reportRepository.getCategoryStatistics();
        Map<String, Long> categoryCounts = categoryStats.stream()
            .collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> (Long) row[1]
            ));
        
        // 최근 7일간 신고 수
        List<Object[]> recentStats = reportRepository.getRecentReportsCount(7);
        Map<String, Long> recentCounts = recentStats.stream()
            .collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> (Long) row[1]
            ));
        
        return Map.of(
            "statusCounts", statusCounts,
            "typeCounts", typeCounts,
            "categoryCounts", categoryCounts,
            "recentCounts", recentCounts,
            "totalPending", reportRepository.countByStatus(Report.Status.PENDING),
            "totalProcessing", reportRepository.countByStatus(Report.Status.PROCESSING)
        );
    }

    /**
     * 신고 상세 조회
     */
    public Report getReport(Long reportId) {
        return reportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다"));
    }

    /**
     * 신고자별 신고 목록 조회
     */
    public List<Report> getReportsByReporter(UUID reporterId) {
        log.info("신고자별 신고 목록 조회: reporterId={}", reporterId);
        return reportRepository.findByReporterId(reporterId);
    }



    /**
     * 통합 신고 생성 메서드
     */
    @Transactional
    public Report createReport(UUID reporterId, Report.TargetType targetType, Long targetId, String reason, Report.Category category, UUID targetUserId) {
        log.info("신고 생성: 신고자={}, 타입={}, 대상ID={}, 사유={}, 카테고리={}, 대상사용자={}", reporterId, targetType, targetId, reason, category, targetUserId);

        // 중복 신고 확인
        if (targetType == Report.TargetType.USER) {
            if (targetUserId == null) {
                throw new IllegalArgumentException("사용자 신고에는 targetUserId가 필요합니다");
            }
            if (reportRepository.existsByReporterIdAndTargetTypeAndTargetUserId(reporterId, targetType, targetUserId)) {
                throw new IllegalArgumentException("이미 신고한 사용자입니다");
            }
        } else if (targetId != null && reportRepository.existsByReporterIdAndTargetTypeAndTargetId(reporterId, targetType, targetId)) {
            throw new IllegalArgumentException("이미 신고한 대상입니다");
        }

        // 신고자 존재 확인
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new IllegalArgumentException("신고자를 찾을 수 없습니다"));

        // 신고 생성
        Report report;
        switch (targetType) {
            case POST:
                report = Report.createPostReport(reporterId, targetId, reason, category);
                break;
            case COMMENT:
                report = Report.createCommentReport(reporterId, targetId, reason, category);
                break;
            case USER:
                if (targetUserId == null) {
                    throw new IllegalArgumentException("사용자 신고에는 targetUserId가 필요합니다");
                }
                report = Report.createUserReport(reporterId, targetUserId, reason, category);
                break;
            default:
                throw new IllegalArgumentException("지원하지 않는 신고 대상 타입입니다: " + targetType);
        }

        Report savedReport = reportRepository.save(report);

        log.info("신고 생성 완료: 신고ID={}, 신고자={}, 타입={}",
            savedReport.getReportId(), reporterId, targetType);

        return savedReport;
    }
}
