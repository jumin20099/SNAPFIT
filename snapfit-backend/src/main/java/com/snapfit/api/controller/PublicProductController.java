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

    /**
     * 조회수 증가(중복 방지) 엔드포인트.
     * - 로그인 사용자는 userId 기준
     * - 비로그인은 헤더 X-Anon-Id 기준(프론트에서 발급/전달)
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<?> addViewOnce(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Anon-Id", required = false) String anonId
    ) {
        String userKey;
        if (user != null && user.getUserIdx() != null) {
            userKey = "u:" + user.getUserIdx();
        } else if (anonId != null && !anonId.isBlank()) {
            userKey = "a:" + anonId;
        } else {
            return ResponseEntity.ok().body(java.util.Map.of(
                    "updated", false,
                    "reason", "no-identifier"
            ));
        }

        // 24시간 롤링 윈도우(캘린더 경계 영향 없음)
        String seenKey = "view:seen24:" + id + ":" + userKey;
        long updated = viewCounterService.addSeenRollingIfNew(seenKey, 24L * 3600); // 24시간 TTL (실제 조회수)
        if (updated == 1) {
            // 중복이 아닌 경우에만 DB 누적 +1
            ProductDetailDto dto = productService.getProductDetail(id, user, true);
            com.snapfit.api.entity.Product p = dto.getProduct();
            p.setViewCount((p.getViewCount() == null ? 0L : p.getViewCount()) + 1);
            p.setActualViewCount((p.getActualViewCount() == null ? 0L : p.getActualViewCount()) + 1);
            productService.saveProduct(p);
            // 실시간 방송도 함께 갱신
            viewCounterService.increment("product:" + id + ":live");
        }

        return ResponseEntity.ok(java.util.Map.of(
                "updated", updated == 1
        ));
    }
} 