package com.snapfit.api.controller;

import com.snapfit.api.dto.ProductDetailDto;
import com.snapfit.api.entity.Product;
import com.snapfit.api.entity.User;
import com.snapfit.api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;

    /**
     * 상품 상세 조회 (증가는 Service에서 일괄 수행).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDto> getProductDetail(@PathVariable Long id,
                                                             @AuthenticationPrincipal User user,
                                                             @RequestParam(name = "skipIncrement", required = false) Boolean skipIncrement) {
        boolean skip = Boolean.TRUE.equals(skipIncrement);
        ProductDetailDto dto = productService.getProductDetail(id, user, skip);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<Product>> list(
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String sub) {
        try {
    
            List<Product> products = productService.getActiveProducts(major, sub);
            // 신상 카테고리 자동 처리
            products = productService.processNewProductCategory(products);

            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.err.println("Error in list endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
} 