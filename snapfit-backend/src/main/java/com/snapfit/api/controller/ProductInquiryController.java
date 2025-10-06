package com.snapfit.api.controller;

import com.snapfit.api.dto.AnswerInquiryRequest;
import com.snapfit.api.dto.CreateInquiryRequest;
import com.snapfit.api.dto.ProductInquiryDto;
import com.snapfit.api.entity.ProductInquiry;
import com.snapfit.api.entity.User;
import com.snapfit.api.service.ProductInquiryService;
import com.snapfit.api.service.AnonymousUserService;
import com.snapfit.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/products/{productId}/inquiries")
@RequiredArgsConstructor
@Slf4j
public class ProductInquiryController {
    
    private final ProductInquiryService inquiryService;
    private final AnonymousUserService anonymousUserService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 문의 작성
     */
    @PostMapping
    public ResponseEntity<ProductInquiryDto> createInquiry(
            @PathVariable Long productId,
            @Valid @RequestBody CreateInquiryRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        
        try {
            UUID userId = null;
            String anonymousPasswordHash = null;
            Integer anonymousIndex = null;
            
            // JWT 토큰으로 인증된 사용자 조회
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    String email = jwtUtil.getSubjectFromToken(token);
                    if (email != null) {
                        userId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
                        log.info("인증된 사용자 문의 작성: email={}", email);
                    }
                } catch (Exception e) {
                    log.warn("JWT 토큰 파싱 실패: {}", e.getMessage());
                }
            }
            
            // 익명 사용자인 경우 비밀번호 검증
            if (userId == null) {
                String anonymousPassword = request.getAnonymousPassword();
                if (!StringUtils.hasText(anonymousPassword) || anonymousPassword.trim().length() < 4) {
                    return ResponseEntity.badRequest().build();
                }
                anonymousPasswordHash = passwordEncoder.encode(anonymousPassword.trim());
                
                String userIdentifier = getClientIp(clientIp, realIp);
                anonymousIndex = anonymousUserService.getOrAssignAnonymousIndex(productId, userIdentifier);
                log.info("익명 사용자 문의 작성: productId={}, userIdentifier={}, anonymousIndex={}", productId, userIdentifier, anonymousIndex);
            }
            
            ProductInquiryDto inquiry = inquiryService.createInquiry(userId, productId, request, anonymousPasswordHash, anonymousIndex);
            return ResponseEntity.ok(inquiry);
        } catch (RuntimeException e) {
            log.warn("문의 작성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 문의 삭제
     */
    @DeleteMapping("/{inquiryId}")
    public ResponseEntity<Void> deleteInquiry(
            @PathVariable Long productId,
            @PathVariable Long inquiryId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "password", required = false) String password) {
        
        try {
            UUID userId = null;
            
            // JWT 토큰으로 인증된 사용자 조회
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    String email = jwtUtil.getSubjectFromToken(token);
                    if (email != null) {
                        userId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
                    }
                } catch (Exception e) {
                    log.warn("JWT 토큰 파싱 실패: {}", e.getMessage());
                }
            }
            
            inquiryService.deleteInquiry(inquiryId, userId, password);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("문의 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIp(String forwardedFor, String realIp) {
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            return forwardedFor.split(",")[0].trim();
        }
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }
        return "unknown";
    }
    
    /**
     * 상품별 문의 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<ProductInquiryDto>> getProductInquiries(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        // 개발 환경에서는 하드코딩된 사용자 ID 사용
        UUID currentUserId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
        
        Page<ProductInquiryDto> inquiries = inquiryService.getProductInquiries(
            productId, pageable, currentUserId);
        
        return ResponseEntity.ok(inquiries);
    }
    
    /**
     * 사용자의 문의 목록 조회
     */
    @GetMapping("/my")
    public ResponseEntity<Page<ProductInquiryDto>> getMyInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductInquiryDto> inquiries = inquiryService.getUserInquiries(user.getUserIdx(), pageable);
        
        return ResponseEntity.ok(inquiries);
    }
    
    /**
     * 답변 대기 중인 문의 목록 조회 (관리자용)
     */
    @GetMapping("/pending")
    public ResponseEntity<Page<ProductInquiryDto>> getPendingInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductInquiryDto> inquiries = inquiryService.getPendingInquiries(pageable, user.getUserIdx());
        
        return ResponseEntity.ok(inquiries);
    }
    
    /**
     * 문의 답변
     */
    @PostMapping("/{inquiryId}/answer")
    public ResponseEntity<ProductInquiryDto> answerInquiry(
            @PathVariable Long productId,
            @PathVariable Long inquiryId,
            @Valid @RequestBody AnswerInquiryRequest request) {
        
        // 개발 환경에서는 하드코딩된 사용자 ID 사용
        UUID userId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
        
        try {
            ProductInquiryDto inquiry = inquiryService.answerInquiry(inquiryId, request, userId);
            return ResponseEntity.ok(inquiry);
        } catch (RuntimeException e) {
            log.warn("문의 답변 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 문의 상태 변경 (관리자용)
     */
    @PutMapping("/{inquiryId}/status")
    public ResponseEntity<ProductInquiryDto> updateInquiryStatus(
            @PathVariable Long productId,
            @PathVariable Long inquiryId,
            @RequestParam String status,
            @AuthenticationPrincipal User user) {
        
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            ProductInquiry.InquiryStatus inquiryStatus = ProductInquiry.InquiryStatus.valueOf(status.toUpperCase());
            ProductInquiryDto inquiry = inquiryService.updateInquiryStatus(inquiryId, inquiryStatus, user.getUserIdx());
            return ResponseEntity.ok(inquiry);
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 상태 값: {}", status);
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            log.warn("문의 상태 변경 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
}
