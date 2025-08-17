package com.snapfit.api.dto.ranking;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class RankingPostDto {
    private Long postId;
    private String content;
    private String authorName;
    private String authorAvatar;
    private String thumbnailUrl; // 첫 번째 이미지만
    private String[] mediaUrls; // 모든 이미지 URL 배열
    private String[] tags; // 태그 배열
    private Integer likeCount;
    private Integer commentCount;
    private Integer scrapCount;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private Double rankingScore;
}
