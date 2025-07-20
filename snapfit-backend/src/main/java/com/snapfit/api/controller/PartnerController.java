package com.snapfit.api.controller;

import com.snapfit.api.dto.PartnerApplicationDto;
import com.snapfit.api.dto.PartnerProductDto;
import com.snapfit.api.dto.PartnerDashboardDto;
import com.snapfit.api.service.PartnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partner")
@CrossOrigin(origins = "*")
public class PartnerController {
    
    @Autowired
    private PartnerService partnerService;
    
    // 제휴사 신청 제출
    @PostMapping("/application")
    public ResponseEntity<PartnerApplicationDto> submitApplication(@RequestBody PartnerApplicationDto dto) {
        try {
            PartnerApplicationDto result = partnerService.submitApplication(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 제휴사 신청 조회
    @GetMapping("/application")
    public ResponseEntity<PartnerApplicationDto> getApplication() {
        try {
            PartnerApplicationDto result = partnerService.getApplication();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 제휴사 신청 수정
    @PutMapping("/application/{id}")
    public ResponseEntity<PartnerApplicationDto> updateApplication(@PathVariable Long id, @RequestBody PartnerApplicationDto dto) {
        try {
            PartnerApplicationDto result = partnerService.updateApplication(id, dto);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 상품 등록
    @PostMapping("/products")
    public ResponseEntity<PartnerProductDto> submitProduct(@RequestBody PartnerProductDto dto) {
        try {
            PartnerProductDto result = partnerService.submitProduct(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 상품 목록 조회
    @GetMapping("/products")
    public ResponseEntity<List<PartnerProductDto>> getProducts(@RequestParam(required = false) Long partnerApplicationId) {
        try {
            // 현재는 단순화하여 partnerApplicationId가 1인 것으로 가정
            Long applicationId = partnerApplicationId != null ? partnerApplicationId : 1L;
            List<PartnerProductDto> result = partnerService.getProducts(applicationId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 상품 수정
    @PutMapping("/products/{id}")
    public ResponseEntity<PartnerProductDto> updateProduct(@PathVariable Long id, @RequestBody PartnerProductDto dto) {
        try {
            PartnerProductDto result = partnerService.updateProduct(id, dto);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 대시보드 정보 조회
    @GetMapping("/dashboard")
    public ResponseEntity<PartnerDashboardDto> getDashboard(@RequestParam(required = false) Long partnerApplicationId) {
        try {
            // 현재는 단순화하여 partnerApplicationId가 1인 것으로 가정
            Long applicationId = partnerApplicationId != null ? partnerApplicationId : 1L;
            PartnerDashboardDto result = partnerService.getDashboard(applicationId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 