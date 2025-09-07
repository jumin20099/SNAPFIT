package com.snapfit.api.controller;

import com.snapfit.api.dto.ProductApprovalActionDto;
import com.snapfit.api.service.PartnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private PartnerService partnerService;
    
    // 상품 승인/거절 및 활성화/비활성화
    @PutMapping("/products/{id}/status")
    public ResponseEntity<?> updateProductStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody) {
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
