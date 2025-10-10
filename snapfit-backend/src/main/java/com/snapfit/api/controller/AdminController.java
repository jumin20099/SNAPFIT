package com.snapfit.api.controller;

import com.snapfit.api.dto.ProductApprovalActionDto;
import com.snapfit.api.service.PartnerService;
import com.snapfit.api.service.UserService;
import com.snapfit.api.entity.User;
import com.snapfit.api.entity.User.Role;
import com.snapfit.api.security.JwtUtil;
import com.snapfit.api.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(
    origins = {"http://localhost:3000", "https://snapfit.app", "https://www.snapfit.app"},
    allowCredentials = "true",
    allowedHeaders = {"*"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class AdminController {
    
    @Autowired
    private PartnerService partnerService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // 상품 승인/거절 및 활성화/비활성화
    @PutMapping("/products/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProductStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            // 기존 승인/거절 로직
            if (requestBody.containsKey("action")) {
                String action = (String) requestBody.get("action");
                if ("approve".equals(action)) {
                    partnerService.approveProduct(id);
                    return ResponseEntity.ok(Map.of("message", "상품이 승인되었습니다."));
                } else if ("reject".equals(action)) {
                    String rejectionReason = (String) requestBody.get("rejectionReason");
                    partnerService.rejectProduct(id, rejectionReason);
                    return ResponseEntity.ok(Map.of("message", "상품이 거절되었습니다."));
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "잘못된 액션입니다."));
                }
            }
            
            // 새로운 활성화/비활성화 로직
            if (requestBody.containsKey("isActive")) {
                Boolean isActive = (Boolean) requestBody.get("isActive");
                partnerService.updateProductActiveStatus(id, isActive);
                return ResponseEntity.ok(Map.of("message", "상품 상태가 변경되었습니다.", "isActive", isActive));
            }
            
            return ResponseEntity.badRequest().body(Map.of("error", "잘못된 요청입니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 임시 사용자로 로그인 (개발/테스트용)
     * 일반 사용자 권한으로 로그인하여 시스템 점검
     * 운영 환경에서는 비활성화됩니다.
     */
    @PostMapping("/temp-login")
    @PreAuthorize("hasRole('ADMIN')")
    @ConditionalOnProperty(name = "app.features.temp-login", havingValue = "true", matchIfMissing = false)
    public ResponseEntity<?> tempLogin(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            // 임시 사용자 이메일
            String tempEmail = "temp_user@snapfit.com";
            
            // 기존 임시 사용자 확인 또는 생성
            User tempUser = userService.findByEmail(tempEmail);
            if (tempUser == null) {
                // 임시 사용자 생성
                tempUser = User.builder()
                    .userIdx(UUID.randomUUID())
                    .email(tempEmail)
                    .nickname("임시사용자")
                    .provider("temp")
                    .providerId("temp_001")
                    .role(Role.USER)
                    .bio("테스트용 임시 사용자입니다")
                    .followerCount(0)
                    .followingCount(0)
                    .build();
                
                tempUser = userService.save(tempUser);
            }
            
            // JWT 토큰 생성
            String token = jwtUtil.generateToken(tempUser.getEmail(), tempUser.getRole().name());
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                    "userIdx", tempUser.getUserIdx().toString(),
                    "email", tempUser.getEmail(),
                    "nickname", tempUser.getNickname(),
                    "role", tempUser.getRole().name()
                ),
                "message", "임시 사용자로 로그인되었습니다"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "임시 로그인 실패: " + e.getMessage()));
        }
    }
}
