package com.snapfit.api.controller;

import com.snapfit.api.dto.report.ReportCreateRequest;
import com.snapfit.api.dto.report.ReportResponseDto;
import com.snapfit.api.entity.Report;
import com.snapfit.api.service.ReportService;
import com.snapfit.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
public class ReportController {

    private final ReportService reportService;

    /**
     * 신고 생성 (게시글, 댓글, 사용자)
     * POST /api/reports
     */
    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestBody ReportCreateRequest createRequest,
            @RequestParam(value = "token", required = false) String token,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        log.info("신고 생성 요청: body={}, token={}", createRequest, token);

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

            Report.TargetType resolvedTargetType = createRequest.resolveTargetType();
            if (resolvedTargetType == null) {
                throw new IllegalArgumentException("신고 대상 타입이 필요합니다");
            }

            Long resolvedTargetId = createRequest.resolveTargetId();
            String trimmedReason = createRequest.getReason() == null ? null : createRequest.getReason().trim();
            if (trimmedReason != null && trimmedReason.isEmpty()) {
                trimmedReason = null;
            }

            Report.Category category = createRequest.resolveCategory();

            Report report = reportService.createReport(
                reporterId,
                resolvedTargetType,
                resolvedTargetId,
                trimmedReason,
                category,
                createRequest.getTargetUserId()
            );
            
            log.info("신고 생성 성공: reportId={}, reporter={}, target={}:{}", 
                report.getReportId(), reporterId, resolvedTargetType, resolvedTargetId);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "success", true,
                    "report", ReportResponseDto.from(report),
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

            Pageable pageable = PageRequest.of(page, size);
            Page<Report> reportPage = reportService.getMyReports(reporterId, pageable);
            List<ReportResponseDto> content = reportPage.getContent().stream()
                .map(ReportResponseDto::from)
                .toList();

            return ResponseEntity.ok(Map.of(
                "content", content,
                "totalElements", reportPage.getTotalElements(),
                "totalPages", reportPage.getTotalPages(),
                "size", reportPage.getSize(),
                "number", reportPage.getNumber()
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

            List<ReportResponseDto> content = reports.getContent().stream()
                .map(ReportResponseDto::from)
                .toList();
            
            return ResponseEntity.ok(content);
            
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

            List<ReportResponseDto> content = reports.getContent().stream()
                .map(ReportResponseDto::from)
                .toList();

            return ResponseEntity.ok(Map.of(
                "content", content,
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
            response.put("report", ReportResponseDto.from(updatedReport));
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
