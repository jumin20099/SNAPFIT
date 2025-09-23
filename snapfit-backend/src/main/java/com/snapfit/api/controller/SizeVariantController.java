package com.snapfit.api.controller;

import com.snapfit.api.dto.SizeVariantDto;
import com.snapfit.api.service.SizeVariantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class SizeVariantController {
    
    private final SizeVariantService sizeVariantService;
    
    /**
     * 상품별 사이즈 정보 조회
     * GET /api/products/{productId}/sizes
     */
    @GetMapping("/{productId}/sizes")
    public ResponseEntity<List<SizeVariantDto>> getProductSizes(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "false") boolean inStockOnly) {
        
        try {
            log.info("상품 {}의 사이즈 정보 조회 요청 (재고만: {})", productId, inStockOnly);
            
            List<SizeVariantDto> sizes;
            if (inStockOnly) {
                sizes = sizeVariantService.getInStockSizeVariantsByProduct(productId);
            } else {
                sizes = sizeVariantService.getSizeVariantsByProduct(productId);
            }
            
            log.info("상품 {}의 사이즈 정보 조회 완료: {}개", productId, sizes.size());
            return ResponseEntity.ok(sizes);
            
        } catch (Exception e) {
            log.error("상품 {}의 사이즈 정보 조회 실패", productId, e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 특정 사이즈 정보 조회
     * GET /api/products/{productId}/sizes/{sizeVariantId}
     */
    @GetMapping("/{productId}/sizes/{sizeVariantId}")
    public ResponseEntity<SizeVariantDto> getSizeVariant(
            @PathVariable Long productId,
            @PathVariable Long sizeVariantId) {
        
        try {
            log.info("사이즈 변형 {} 조회 요청", sizeVariantId);
            
            return sizeVariantService.getSizeVariant(sizeVariantId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            log.error("사이즈 변형 {} 조회 실패", sizeVariantId, e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * SKU로 사이즈 정보 조회
     * GET /api/products/sizes/sku/{sku}
     */
    @GetMapping("/sizes/sku/{sku}")
    public ResponseEntity<SizeVariantDto> getSizeVariantBySku(@PathVariable String sku) {
        try {
            log.info("SKU {}로 사이즈 정보 조회 요청", sku);
            
            return sizeVariantService.getSizeVariantBySku(sku)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            log.error("SKU {}로 사이즈 정보 조회 실패", sku, e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 사이즈 변형 생성 (관리자용)
     * POST /api/products/{productId}/sizes
     */
    @PostMapping("/{productId}/sizes")
    public ResponseEntity<SizeVariantDto> createSizeVariant(
            @PathVariable Long productId,
            @RequestBody SizeVariantDto sizeVariantDto) {
        
        try {
            log.info("상품 {}에 사이즈 변형 생성 요청: {}", productId, sizeVariantDto.getSizeLabel());
            
            SizeVariantDto created = sizeVariantService.createSizeVariant(productId, sizeVariantDto);
            
            log.info("사이즈 변형 생성 완료: {}", created.getSizeVariantId());
            return ResponseEntity.ok(created);
            
        } catch (IllegalArgumentException e) {
            log.warn("사이즈 변형 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("사이즈 변형 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 사이즈 변형 수정 (관리자용)
     * PUT /api/products/{productId}/sizes/{sizeVariantId}
     */
    @PutMapping("/{productId}/sizes/{sizeVariantId}")
    public ResponseEntity<SizeVariantDto> updateSizeVariant(
            @PathVariable Long productId,
            @PathVariable Long sizeVariantId,
            @RequestBody SizeVariantDto sizeVariantDto) {
        
        try {
            log.info("사이즈 변형 {} 수정 요청", sizeVariantId);
            
            SizeVariantDto updated = sizeVariantService.updateSizeVariant(sizeVariantId, sizeVariantDto);
            
            log.info("사이즈 변형 수정 완료: {}", sizeVariantId);
            return ResponseEntity.ok(updated);
            
        } catch (IllegalArgumentException e) {
            log.warn("사이즈 변형 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("사이즈 변형 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 사이즈 변형 삭제 (관리자용)
     * DELETE /api/products/{productId}/sizes/{sizeVariantId}
     */
    @DeleteMapping("/{productId}/sizes/{sizeVariantId}")
    public ResponseEntity<Void> deleteSizeVariant(
            @PathVariable Long productId,
            @PathVariable Long sizeVariantId) {
        
        try {
            log.info("사이즈 변형 {} 삭제 요청", sizeVariantId);
            
            sizeVariantService.deleteSizeVariant(sizeVariantId);
            
            log.info("사이즈 변형 삭제 완료: {}", sizeVariantId);
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            log.warn("사이즈 변형 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("사이즈 변형 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 재고 부족 사이즈 조회 (관리자용)
     * GET /api/products/{productId}/sizes/low-stock
     */
    @GetMapping("/{productId}/sizes/low-stock")
    public ResponseEntity<List<SizeVariantDto>> getLowStockSizes(@PathVariable Long productId) {
        try {
            log.info("상품 {}의 재고 부족 사이즈 조회 요청", productId);
            
            List<SizeVariantDto> lowStockSizes = sizeVariantService.getLowStockSizeVariants(productId);
            
            log.info("재고 부족 사이즈 조회 완료: {}개", lowStockSizes.size());
            return ResponseEntity.ok(lowStockSizes);
            
        } catch (Exception e) {
            log.error("재고 부족 사이즈 조회 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
