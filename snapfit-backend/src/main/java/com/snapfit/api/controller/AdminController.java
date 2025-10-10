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
    allowedHeaders = {"Content-Type", "Authorization", "X-Requested-With"},
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
    
}
