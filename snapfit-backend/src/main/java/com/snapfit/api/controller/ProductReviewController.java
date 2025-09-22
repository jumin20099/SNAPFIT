package com.snapfit.api.controller;

import com.snapfit.api.dto.CreateReviewRequest;
import com.snapfit.api.dto.ProductReviewDto;
import com.snapfit.api.entity.User;
import com.snapfit.api.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
@Slf4j
public class ProductReviewController {
    
    private final ProductReviewService reviewService;
    
    /**
     * 리뷰 작성
     */
    @PostMapping
    public ResponseEntity<ProductReviewDto> createReview(
            @PathVariable Long productId,
            @Valid @RequestBody CreateReviewRequest request) {
        
        // 개발 환경에서는 하드코딩된 사용자 ID 사용
        UUID userId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
        
        try {
            ProductReviewDto review = reviewService.createReview(userId, productId, request);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            log.warn("리뷰 작성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 상품별 리뷰 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<ProductReviewDto>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "recent") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // 정렬 기준 설정
        Sort sort;
        switch (sortBy) {
            case "rating":
                sort = Sort.by(Sort.Direction.DESC, "rating", "createdAt");
                break;
            case "helpful":
                sort = Sort.by(Sort.Direction.DESC, "helpfulCount", "createdAt");
                break;
            default: // recent
                sort = Sort.by(Sort.Direction.DESC, "createdAt");
                break;
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        // 개발 환경에서는 하드코딩된 사용자 ID 사용
        UUID currentUserId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
        
        Page<ProductReviewDto> reviews = reviewService.getProductReviews(
            productId, sortBy, pageable, currentUserId);
        
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * 리뷰 도움됨 토글
     */
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<ProductReviewDto> toggleHelpful(
            @PathVariable Long productId,
            @PathVariable Long reviewId) {
        
        // 개발 환경에서는 하드코딩된 사용자 ID 사용
        UUID userId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
        
        try {
            ProductReviewDto review = reviewService.toggleHelpful(reviewId, userId);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            log.warn("도움됨 토글 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 리뷰 신고
     */
    @PostMapping("/{reviewId}/report")
    public ResponseEntity<Void> reportReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId) {
        
        // 개발 환경에서는 하드코딩된 사용자 ID 사용
        UUID userId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
        
        try {
            reviewService.reportReview(reviewId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.warn("리뷰 신고 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 리뷰 수정
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ProductReviewDto> updateReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @Valid @RequestBody CreateReviewRequest request) {
        
        // 개발 환경에서는 하드코딩된 사용자 ID 사용
        UUID userId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
        
        try {
            ProductReviewDto review = reviewService.updateReview(reviewId, userId, request);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            log.warn("리뷰 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 리뷰 삭제
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId) {
        
        log.info("리뷰 삭제 요청: productId={}, reviewId={}", productId, reviewId);
        
        // 개발 환경에서는 하드코딩된 사용자 ID 사용
        UUID userId = UUID.fromString("87b18a9c-d2ba-4318-b9aa-859e03c5aad7");
        
        try {
            reviewService.deleteReview(reviewId, userId);
            log.info("리뷰 삭제 성공: reviewId={}", reviewId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("리뷰 삭제 실패: reviewId={}, error={}", reviewId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
