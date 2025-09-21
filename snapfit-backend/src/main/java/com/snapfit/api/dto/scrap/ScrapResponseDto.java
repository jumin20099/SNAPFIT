package com.snapfit.api.dto.scrap;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 스크랩 응답 DTO
 */
@Data
public class ScrapResponseDto {

    private Long scrapId;
    private Long postId;
    private String postTitle;
    private String postContent;
    private List<String> postMediaUrls;
    private List<String> postTags;
    private Long postAuthorId;
    private String postAuthorName;
    private Long postLikeCount;
    private Long postCommentCount;
    private Long postViewCount;
    private LocalDateTime scrapedAt;
}
