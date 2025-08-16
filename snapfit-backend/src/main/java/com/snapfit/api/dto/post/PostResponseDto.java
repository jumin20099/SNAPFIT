package com.snapfit.api.dto.post;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 게시글 응답 DTO
 */
@Data
public class PostResponseDto {

    private Long postId;
    private String title;
    private String content;
    private List<String> tags;
    private List<String> mediaUrls;
    private String authorId; // UUID를 String으로 변환
    private String authorName;
    private String authorProfileImage;
    private Long likeCount;
    private Long scrapCount;
    private Long commentCount;
    private Long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isLiked;
    private Boolean isScrapped;
}
