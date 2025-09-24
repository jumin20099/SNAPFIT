package com.snapfit.api.service;

import com.snapfit.api.dto.CreateReviewRequest;
import com.snapfit.api.dto.ProductReviewDto;
import com.snapfit.api.entity.ProductReview;
import com.snapfit.api.entity.ReviewHelpful;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.ProductReviewRepository;
import com.snapfit.api.repository.ReviewHelpfulRepository;
import com.snapfit.api.repository.OrderItemRepository;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.repository.UserMeasurementsRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductReviewService {
    
    private final ProductReviewRepository reviewRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final UserMeasurementsRepository userMeasurementsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 리뷰 작성 (구매자만 가능)
     */
    @Transactional
    public ProductReviewDto createReview(UUID userId, Long productId, CreateReviewRequest request) {
        log.info("리뷰 작성 요청: userId={}, productId={}", userId, productId);
        
        // 구매자 검증
        if (!hasUserPurchasedProduct(userId, productId)) {
            throw new RuntimeException("구매자만 리뷰를 작성할 수 있습니다");
        }
        
        // 중복 리뷰 검증
        if (reviewRepository.findByProductIdAndUserUserIdxAndStatus(
            productId, userId, ProductReview.ReviewStatus.PUBLISHED).isPresent()) {
            throw new RuntimeException("이미 리뷰를 작성하셨습니다");
        }
        
        // 사용자 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        // 이미지 배열을 JSON 문자열로 변환
        String imagesJson = null;
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                imagesJson = objectMapper.writeValueAsString(request.getImages());
            } catch (JsonProcessingException e) {
                log.warn("이미지 배열 JSON 변환 실패: {}", e.getMessage());
                imagesJson = "[]";
            }
        } else {
            imagesJson = "[]";
        }
        
        // 리뷰 생성
        ProductReview review = ProductReview.builder()
            .productId(productId)
            .user(user)
            .rating(request.getRating())
            .content(request.getContent())
            .images(imagesJson)
            .status(ProductReview.ReviewStatus.PUBLISHED)
            .build();
        
        review = reviewRepository.save(review);
        log.info("리뷰 작성 완료: reviewId={}", review.getReviewId());
        
        return convertToDto(review, false, userId);
    }
    
    /**
     * 상품별 리뷰 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<ProductReviewDto> getProductReviews(Long productId, String sortBy, Pageable pageable, UUID currentUserId) {
        Page<ProductReview> reviews;
        
        switch (sortBy) {
            case "rating":
                reviews = reviewRepository.findByProductIdAndStatusOrderByRatingDescCreatedAtDesc(
                    productId, ProductReview.ReviewStatus.PUBLISHED, pageable);
                break;
            case "helpful":
                reviews = reviewRepository.findByProductIdAndStatusOrderByHelpfulCountDescCreatedAtDesc(
                    productId, ProductReview.ReviewStatus.PUBLISHED, pageable);
                break;
            default: // recent
                reviews = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(
                    productId, ProductReview.ReviewStatus.PUBLISHED, pageable);
                break;
        }
        
        return reviews.map(review -> convertToDto(review, false, currentUserId));
    }
    
    /**
     * 리뷰 도움됨 토글
     */
    @Transactional
    public ProductReviewDto toggleHelpful(Long reviewId, UUID userId) {
        ProductReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));
        
        // 사용자가 이미 도움됨으로 표시했는지 확인
        Optional<ReviewHelpful> existingHelpful = reviewHelpfulRepository.findByReviewIdAndUserUserIdx(reviewId, userId);
        
        if (existingHelpful.isPresent()) {
            // 이미 도움됨으로 표시했으면 제거
            reviewHelpfulRepository.delete(existingHelpful.get());
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
        } else {
            // 도움됨으로 표시하지 않았으면 추가
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
            
            ReviewHelpful reviewHelpful = ReviewHelpful.builder()
                .reviewId(reviewId)
                .user(user)
                .build();
            
            reviewHelpfulRepository.save(reviewHelpful);
            review.setHelpfulCount(review.getHelpfulCount() + 1);
        }
        
        review = reviewRepository.save(review);
        
        // 사용자가 현재 도움됨으로 표시했는지 확인
        boolean isHelpfulByUser = reviewHelpfulRepository.existsByReviewIdAndUserUserIdx(reviewId, userId);
        
        return convertToDto(review, isHelpfulByUser, userId);
    }
    
    /**
     * 리뷰 신고
     */
    @Transactional
    public void reportReview(Long reviewId, UUID userId) {
        ProductReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));
        
        review.setIsReported(true);
        reviewRepository.save(review);
        
        log.info("리뷰 신고: reviewId={}, userId={}", reviewId, userId);
    }
    
    /**
     * 리뷰 수정
     */
    @Transactional
    public ProductReviewDto updateReview(Long reviewId, UUID userId, CreateReviewRequest request) {
        ProductReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다"));
        
        // 작성자만 수정 가능
        if (!review.getUser().getUserIdx().equals(userId)) {
            throw new RuntimeException("리뷰 작성자만 수정할 수 있습니다");
        }
        
        // 이미지 배열을 JSON 문자열로 변환
        String imagesJson = null;
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                imagesJson = objectMapper.writeValueAsString(request.getImages());
            } catch (JsonProcessingException e) {
                log.warn("이미지 배열 JSON 변환 실패: {}", e.getMessage());
                imagesJson = "[]";
            }
        } else {
            imagesJson = "[]";
        }
        
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setImages(imagesJson);
        review = reviewRepository.save(review);
        
        log.info("리뷰 수정 완료: reviewId={}", review.getReviewId());
        
        return convertToDto(review, false, userId);
    }
    
    /**
     * 리뷰 삭제
     */
    @Transactional
    public void deleteReview(Long reviewId, UUID userId) {
        log.info("리뷰 삭제 요청: reviewId={}, userId={}", reviewId, userId);
        
        ProductReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> {
                log.warn("리뷰를 찾을 수 없습니다: reviewId={}", reviewId);
                return new RuntimeException("리뷰를 찾을 수 없습니다");
            });
        
        log.info("리뷰 작성자 ID: {}, 요청자 ID: {}", review.getUser().getUserIdx(), userId);
        
        // 작성자만 삭제 가능
        if (!review.getUser().getUserIdx().equals(userId)) {
            log.warn("리뷰 작성자가 아닙니다: reviewUserId={}, requestUserId={}", 
                review.getUser().getUserIdx(), userId);
            throw new RuntimeException("리뷰 작성자만 삭제할 수 있습니다");
        }
        
        // 도움됨 기록도 함께 삭제
        reviewHelpfulRepository.deleteByReviewId(reviewId);
        
        // 리뷰 삭제 (하드 삭제 - 개발 환경에서만)
        reviewRepository.delete(review);
        
        log.info("리뷰 삭제 완료: reviewId={}", reviewId);
    }
    
    /**
     * 사용자가 특정 상품을 구매했는지 확인
     */
    private boolean hasUserPurchasedProduct(UUID userId, Long productId) {
        // 개발 환경에서는 구매자 검증 우회
        return true;
        // return reviewRepository.hasUserPurchasedProduct(userId, productId);
    }
    
    /**
     * 엔티티를 DTO로 변환
     */
    private ProductReviewDto convertToDto(ProductReview review, boolean isHelpfulByUser, UUID viewerId) {
        ProductReviewDto.ProductReviewDtoBuilder builder = ProductReviewDto.builder()
            .reviewId(review.getReviewId())
            .productId(review.getProductId())
            .userId(review.getUser().getUserIdx())
            .userNickname(review.getUser().getNickname())
            .userProfileImage(review.getUser().getProfileImage())
            .rating(review.getRating())
            .content(review.getContent())
            .images(parseImages(review.getImages()))
            .helpfulCount(review.getHelpfulCount())
            .isReported(review.getIsReported())
            .status(review.getStatus())
            .createdAt(review.getCreatedAt())
            .updatedAt(review.getUpdatedAt())
            .isHelpfulByUser(isHelpfulByUser);

        applyReviewerMeasurements(review, builder, viewerId);

        return builder.build();
    }

    private void applyReviewerMeasurements(ProductReview review, ProductReviewDto.ProductReviewDtoBuilder builder, UUID viewerId) {
        if (review.getUser() == null) {
            return;
        }

        userMeasurementsRepository.findByUserId(review.getUser().getUserIdx())
            .ifPresent(measurements -> {
                boolean isOwner = viewerId != null && viewerId.equals(review.getUser().getUserIdx());
                if (Boolean.TRUE.equals(measurements.getIsPublic()) || isOwner) {
                    builder.userHeightCm(measurements.getHeightCm());
                    builder.userWeightKg(measurements.getWeightKg());
                }
            });
    }
    
    /**
     * JSON 문자열을 이미지 리스트로 파싱
     */
    private List<String> parseImages(String imagesJson) {
        if (imagesJson == null || imagesJson.trim().isEmpty()) {
            return List.of();
        }
        
        try {
            // 간단한 JSON 파싱 (실제로는 Jackson ObjectMapper 사용 권장)
            String cleaned = imagesJson.replaceAll("[\\[\\]\"\\s]", "");
            if (cleaned.isEmpty()) {
                return List.of();
            }
            return List.of(cleaned.split(","));
        } catch (Exception e) {
            log.warn("이미지 JSON 파싱 실패: {}", imagesJson, e);
            return List.of();
        }
    }
}
