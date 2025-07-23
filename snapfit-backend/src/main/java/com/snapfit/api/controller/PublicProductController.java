package com.snapfit.api.controller;

import com.snapfit.api.dto.ProductDetailDto;
import com.snapfit.api.entity.Product;
import com.snapfit.api.entity.User;
import com.snapfit.api.service.ProductService;
import com.snapfit.api.service.ViewCounterService;
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
    private final ViewCounterService viewCounterService;

    /**
     * 상품 상세 조회 + 조회수 증가.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDto> getProductDetail(@PathVariable Long id,
                                                             @AuthenticationPrincipal User user) {
        // 조회수 1증가 및 현재 카운트 조회 후 DTO 반환
        String key = "product:" + id + ":views";
        viewCounterService.increment(key);
        ProductDetailDto dto = productService.getProductDetail(id, user);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<Product>> listByCategory(@RequestParam(required = false) String category) {
        if (category == null || category.isBlank()) {
            // 카테고리 없으면 전체 활성 상품 반환(추후 페이징)
            return ResponseEntity.ok(productService.getActiveProductsByCategory(""));
        }
        return ResponseEntity.ok(productService.getActiveProductsByCategory(category));
    }
} 