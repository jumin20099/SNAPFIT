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
    public ResponseEntity<List<Product>> list(
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String sub) {
        return ResponseEntity.ok(productService.getActiveProducts(major, sub));
    }
} 