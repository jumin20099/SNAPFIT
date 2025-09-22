package com.snapfit.api.dto;

import com.snapfit.api.entity.ProductReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewDto {
    
    private Long reviewId;
    private Long productId;
    private UUID userId;
    private String userNickname;
    private String userProfileImage;
    private Integer rating;
    private String content;
    private List<String> images;
    private Integer helpfulCount;
    private Boolean isReported;
    private ProductReview.ReviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isHelpfulByUser; // 현재 사용자가 도움됨으로 표시했는지 여부
}
