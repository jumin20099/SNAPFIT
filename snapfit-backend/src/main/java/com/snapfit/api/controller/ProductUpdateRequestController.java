package com.snapfit.api.controller;

import com.snapfit.api.dto.ProductUpdateRequestDto;
import com.snapfit.api.service.PartnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partner/products")
@CrossOrigin(origins = "*")
public class ProductUpdateRequestController {
    
    @Autowired
    private PartnerService partnerService;
    
    // 수정 요청 생성
    @PostMapping("/{productId}/update-request")
    public ResponseEntity<?> createUpdateRequest(
            @PathVariable Long productId,
            @RequestBody ProductUpdateRequestDto requestDto) {
        try {
            ProductUpdateRequestDto result = partnerService.createUpdateRequest(productId, requestDto);
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "수정 요청 생성 실패"));
        }
    }
    
    // 수정 요청 목록 조회 (제휴사용)
    @GetMapping("/update-requests")
    public ResponseEntity<List<ProductUpdateRequestDto>> getMyUpdateRequests() {
        try {
            // TODO: 인증된 사용자의 수정 요청만 조회하도록 구현
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 수정 요청 취소
    @PutMapping("/{productId}/update-request/cancel")
    public ResponseEntity<?> cancelUpdateRequest(@PathVariable Long productId) {
        try {
            var result = partnerService.cancelUpdateRequest(productId);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "수정 요청 취소 실패"));
        }
    }
}
