package com.snapfit.api.dto.community;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 개인화 피드 DTO
 */
@Data
public class PersonalizedFeedDto {

    private Long postId;
    private String title;
    private String content;
    private List<String> tags;
    private Long authorId;
    private String authorName;
    private String authorProfileImage;
    private Long likeCount;
    private Long commentCount;
    private Long viewCount;
    private LocalDateTime createdAt;
    private Boolean isLiked;
    private Boolean isScrapped;
    private Double personalizationScore;
    private String reason;
}
