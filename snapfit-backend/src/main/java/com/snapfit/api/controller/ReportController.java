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
import org.springframework.security.access.prepost.PreAuthorize;
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
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {

        log.info("신고 생성 요청: body={}", createRequest);

        try {
            // 인증 검증 - Spring Security 인증만 허용
            if (userDetails == null) {
                log.warn("인증되지 않은 신고 생성 시도");
                return ResponseEntity.status(401)
                    .body(Map.of("error", "인증이 필요합니다"));
            }

            UUID reporterId = UUID.fromString(userDetails.getUserId());
            log.info("Spring Security 인증: reporterId={}", reporterId);

            Report.TargetType resolvedTargetType = createRequest.resolveTargetType();
            if (resolvedTargetType == null) {
                throw new IllegalArgumentException("신고 대상 타입이 필요합니다");
            }

            Long resolvedTargetId = createRequest.resolveTargetId();
            String trimmedReason = createRequest.getReason() == null ? null : createRequest.getReason().trim();
            if (trimmedReason != null && trimmedReason.isEmpty()) {
                trimmedReason = null;
            }
            
            // 신고 사유 검증 - null이거나 빈 문자열인 경우 경고 로그
            if (trimmedReason == null || trimmedReason.trim().isEmpty()) {
                log.warn("신고 사유가 비어있음: reporterId={}, targetType={}, targetId={}", 
                    reporterId, resolvedTargetType, resolvedTargetId);
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
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("내 신고 목록 조회: page={}, size={}", page, size);

        try {
            // 인증 검증 - Spring Security 인증만 허용
            if (userDetails == null) {
                log.warn("인증되지 않은 신고 목록 조회 시도");
                return ResponseEntity.status(401)
                    .body(Map.of("error", "인증이 필요합니다"));
            }

            UUID reporterId = UUID.fromString(userDetails.getUserId());

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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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

}
