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
    
    // 상품 승인/거절
    @PutMapping("/products/{id}/status")
    public ResponseEntity<?> updateProductStatus(
            @PathVariable Long id,
            @RequestBody ProductApprovalActionDto dto) {
        try {
            if ("approve".equals(dto.getAction())) {
                partnerService.approveProduct(id);
                return ResponseEntity.ok(Map.of("message", "상품이 승인되었습니다."));
            } else if ("reject".equals(dto.getAction())) {
                partnerService.rejectProduct(id, dto.getRejectionReason());
                return ResponseEntity.ok(Map.of("message", "상품이 거절되었습니다."));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "잘못된 액션입니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
