package com.snapfit.api.controller;

import com.snapfit.api.dto.PartnerApplicationDto;
import com.snapfit.api.dto.PartnerProductDto;
import com.snapfit.api.dto.PartnerDashboardDto;
import com.snapfit.api.dto.PartnerApplicationAdminDto;
import com.snapfit.api.dto.PartnerApplicationActionDto;
import com.snapfit.api.dto.ProductApprovalActionDto;
import com.snapfit.api.dto.BulkProductApprovalActionDto;
import com.snapfit.api.service.PartnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partner")
@CrossOrigin(origins = "*")
public class PartnerController {
    
    @Autowired
    private PartnerService partnerService;
    
    // 제휴사 신청 제출
    @PostMapping("/application")
    public ResponseEntity<?> submitApplication(@RequestBody PartnerApplicationDto dto) {
        try {
            PartnerApplicationDto result = partnerService.submitApplication(dto);
            return ResponseEntity.ok(result);
        } catch (IllegalStateException dup) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                                 .body(java.util.Map.of("error", dup.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
            Long applicationId = partnerApplicationId;
            
            // partnerApplicationId가 제공되지 않은 경우, 인증된 사용자의 partnerApplicationId 찾기
            if (applicationId == null) {
                org.springframework.security.core.Authentication authentication = 
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    
                if (authentication != null && authentication.isAuthenticated() && 
                    !"anonymousUser".equals(authentication.getName())) {
                    String email = authentication.getName();
                    applicationId = partnerService.getPartnerApplicationIdByEmail(email);
                }
                
                // 임시: 인증이 안된 경우 partnerApplicationId=4 사용 (테스트용)
                if (applicationId == null) {
                    applicationId = 4L;
                }
            }
            
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
    
    // 상품 삭제
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            boolean ok = partnerService.deleteProduct(id);
            return ok ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // 대시보드 정보 조회
    @GetMapping("/dashboard")
    public ResponseEntity<PartnerDashboardDto> getDashboard(@RequestParam(required = false) Long partnerApplicationId) {
        try {
            Long applicationId = partnerApplicationId;
            
            // partnerApplicationId가 제공되지 않은 경우, 인증된 사용자의 partnerApplicationId 찾기
            if (applicationId == null) {
                org.springframework.security.core.Authentication authentication = 
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    
                if (authentication != null && authentication.isAuthenticated() && 
                    !"anonymousUser".equals(authentication.getName())) {
                    String email = authentication.getName();
                    applicationId = partnerService.getPartnerApplicationIdByEmail(email);
                }
            }
            
            // 여전히 찾지 못한 경우 기본값 사용
            if (applicationId == null) {
                applicationId = 1L;
            }
            
            PartnerDashboardDto result = partnerService.getDashboard(applicationId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ========== 어드민용 API ==========
    
    // 어드민용 제휴 신청 목록 조회
    @GetMapping("/admin/applications")
    public ResponseEntity<List<PartnerApplicationAdminDto>> getAllApplications() {
        try {
            List<PartnerApplicationAdminDto> result = partnerService.getAllApplications();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 어드민용 제휴 신청 상세 조회
    @GetMapping("/admin/applications/{id}")
    public ResponseEntity<PartnerApplicationAdminDto> getApplicationById(@PathVariable Long id) {
        try {
            PartnerApplicationAdminDto result = partnerService.getApplicationById(id);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 어드민용 제휴 신청 승인/거절
    @PutMapping("/admin/applications/{id}/status")
    public ResponseEntity<PartnerApplicationAdminDto> updateApplicationStatus(
            @PathVariable Long id, 
            @RequestBody PartnerApplicationActionDto actionDto) {
        try {
            PartnerApplicationAdminDto result = partnerService.updateApplicationStatus(id, actionDto);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 어드민용 상품 전체 목록 조회 (모든 상태)
    @GetMapping("/admin/products/approvals")
    public ResponseEntity<List<PartnerProductDto>> getAllProducts() {
        try {
            List<PartnerProductDto> result = partnerService.getAllProducts();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 어드민용 상품 개별 승인/거절
    @PutMapping("/admin/products/{id}/status")
    public ResponseEntity<PartnerProductDto> updateProductStatus(
            @PathVariable Long id,
            @RequestBody ProductApprovalActionDto actionDto) {
        try {
            PartnerProductDto result = partnerService.updateProductStatus(id, actionDto);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 어드민용 상품 일괄 승인/거절
    @PutMapping("/admin/products/bulk-status")
    public ResponseEntity<List<PartnerProductDto>> bulkUpdateProductStatus(@RequestBody BulkProductApprovalActionDto bulkDto) {
        try {
            List<PartnerProductDto> result = partnerService.bulkUpdateProductStatus(bulkDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== 수정 요청 관련 API ==========
    
    // 어드민용 수정 요청 목록 조회
    @GetMapping("/admin/products/update-requests")
    public ResponseEntity<List<PartnerProductDto>> getUpdateRequests() {
        try {
            List<PartnerProductDto> result = partnerService.getUpdateRequests();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 어드민용 수정 요청 승인
    @PutMapping("/admin/products/{id}/update-request/approve")
    public ResponseEntity<PartnerProductDto> approveUpdateRequest(@PathVariable Long id) {
        try {
            PartnerProductDto result = partnerService.approveUpdateRequest(id);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 어드민용 수정 요청 거절
    @PutMapping("/admin/products/{id}/update-request/reject")
    public ResponseEntity<PartnerProductDto> rejectUpdateRequest(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        try {
            String rejectionReason = request.get("rejectionReason");
            PartnerProductDto result = partnerService.rejectUpdateRequest(id, rejectionReason);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

} 