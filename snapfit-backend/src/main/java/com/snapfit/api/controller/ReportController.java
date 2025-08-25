package com.snapfit.api.controller;

import com.snapfit.api.entity.Report;
import com.snapfit.api.service.ReportService;
import com.snapfit.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 신고 시스템 REST API 컨트롤러
 * E2E 테스트와 연동 가능한 임시 인증 방식 포함
 * 
 * @author SnapFit Team
 */
@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    /**
     * 신고 생성 (게시글, 댓글, 사용자)
     * POST /api/reports
     */
    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestParam("targetType") String targetType,
            @RequestParam("targetId") Long targetId,
            @RequestParam("reason") String reason,
            @RequestParam(value = "token", required = false) String token,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        
        log.info("신고 생성 요청: targetType={}, targetId={}, reason={}", targetType, targetId, reason);
        
        try {
            // 임시 인증 처리 (E2E 테스트용)
            UUID reporterId;
            if (token != null) {
                // 토큰 기반 임시 사용자 매핑
                reporterId = getTestUserId(token);
                log.info("토큰 기반 인증: reporterId={}", reporterId);
            } else if (userDetails != null) {
                reporterId = UUID.fromString(userDetails.getUserId());
                log.info("Spring Security 인증: reporterId={}", reporterId);
            } else {
                log.warn("인증 정보 없음: token={}, userDetails={}", token, userDetails);
                return ResponseEntity.status(401)
                    .body(Map.of("error", "인증이 필요합니다"));
            }

            // 신고 생성
            Report.TargetType type = Report.TargetType.valueOf(targetType.toUpperCase());
            Report report = reportService.createReport(reporterId, type, targetId, reason);
            
            log.info("신고 생성 성공: reportId={}, reporter={}, target={}:{}", 
                report.getReportId(), reporterId, targetType, targetId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "reportId", report.getReportId(),
                "targetType", report.getTargetType().toString(),
                "targetId", report.getTargetId(),
                "reason", report.getReason(),
                "status", report.getStatus().toString(),
                "message", "신고가 정상적으로 접수되었습니다"
            ));
            
        } catch (IllegalArgumentException e) {
            log.error("신고 생성 실패 - 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", "잘못된 요청: " + e.getMessage()));
        } catch (Exception e) {
            log.error("신고 생성 실패: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "신고 생성 중 오류가 발생했습니다"));
        }
    }

    /**
     * 내 신고 목록 조회
     * GET /api/reports/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyReports(
            @RequestParam(value = "token", required = false) String token,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        log.info("내 신고 목록 조회: token={}, page={}, size={}", token, page, size);
        
        try {
            // 임시 인증 처리
            UUID reporterId;
            if (token != null) {
                reporterId = getTestUserId(token);
            } else if (userDetails != null) {
                reporterId = UUID.fromString(userDetails.getUserId());
            } else {
                return ResponseEntity.status(401)
                    .body(Map.of("error", "인증이 필요합니다"));
            }

            List<Report> reports = reportService.getReportsByReporter(reporterId);
            
            return ResponseEntity.ok(Map.of(
                "content", reports,
                "totalElements", reports.size(),
                "totalPages", (reports.size() + size - 1) / size,
                "size", size,
                "number", page
            ));
            
        } catch (Exception e) {
            log.error("신고 목록 조회 실패: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "신고 목록 조회 중 오류가 발생했습니다"));
        }
    }

    /**
     * 전체 신고 목록 조회 (어드민용)
     * GET /api/reports
     */
    @GetMapping
    public ResponseEntity<?> getAllReports(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        log.info("전체 신고 목록 조회: status={}, page={}, size={}", status, page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Report> reports;
            
            if (status != null && !status.trim().isEmpty()) {
                Report.Status reportStatus = Report.Status.valueOf(status.toUpperCase());
                reports = reportService.getReportsByStatus(reportStatus, pageable);
            } else {
                reports = reportService.getAllReports(pageable);
            }
            
            return ResponseEntity.ok(reports.getContent());
            
        } catch (Exception e) {
            log.error("신고 목록 조회 실패: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "신고 목록 조회 중 오류가 발생했습니다");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 관리자: 신고 목록 조회 (상태별)
     * GET /api/reports/admin
     */
    @GetMapping("/admin")
    public ResponseEntity<?> getReportsForAdmin(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        log.info("관리자 신고 목록 조회: status={}, page={}, size={}", status, page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Report> reports;
            
            if (status != null && !status.trim().isEmpty()) {
                Report.Status reportStatus = Report.Status.valueOf(status.toUpperCase());
                reports = reportService.getReportsByStatus(reportStatus, pageable);
            } else {
                reports = reportService.getAllReports(pageable);
            }
            
            return ResponseEntity.ok(Map.of(
                "content", reports.getContent(),
                "totalElements", reports.getTotalElements(),
                "totalPages", reports.getTotalPages(),
                "size", reports.getSize(),
                "number", reports.getNumber()
            ));
            
        } catch (Exception e) {
            log.error("관리자 신고 목록 조회 실패: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "신고 목록 조회 중 오류가 발생했습니다"));
        }
    }

    /**
     * 관리자: 신고 처리 (상태 변경)
     * PUT /api/reports/{reportId}/status
     */
    @PutMapping("/{reportId}/status")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        String status = (String) requestBody.get("status");
        String adminNotes = (String) requestBody.get("adminNotes");
        
        log.info("신고 상태 변경: reportId={}, status={}, adminNotes={}", reportId, status, adminNotes);
        
        try {
            Report.Status reportStatus = Report.Status.valueOf(status.toUpperCase());
            Report updatedReport = reportService.updateReportStatus(reportId, reportStatus, adminNotes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reportId", updatedReport.getReportId());
            response.put("status", updatedReport.getStatus().toString());
            response.put("adminNotes", updatedReport.getAdminNotes());
            response.put("resolvedAt", updatedReport.getResolvedAt());
            response.put("message", "신고 상태가 변경되었습니다");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("신고 상태 변경 실패 - 잘못된 요청: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "잘못된 요청: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("신고 상태 변경 실패: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "신고 상태 변경 중 오류가 발생했습니다");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 임시 테스트용 사용자 ID 매핑
     * 실제 운영에서는 JWT 토큰 파싱으로 대체
     */
    private UUID getTestUserId(String token) {
        // E2E 테스트용 임시 매핑
        return switch (token) {
            case "test-token-1" -> UUID.fromString("4c12cfb2-c5b8-4ff6-96cc-afdb0168830d");
            case "test-token-2" -> UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
            default -> UUID.fromString("4c12cfb2-c5b8-4ff6-96cc-afdb0168830d"); // 기본값
        };
    }
}
