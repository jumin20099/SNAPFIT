package com.snapfit.api.dto.community;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 인기 게시글 피드 DTO
 */
@Data
public class TrendingFeedDto {

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
    private Long scrapCount;
    private LocalDateTime createdAt;
    private Double trendingScore;
    private String trendingReason;
}
