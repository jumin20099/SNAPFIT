package com.snapfit.api.dto.search;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 게시글 검색 결과 DTO
 */
@Data
public class PostSearchResultDto {

    private Long postId;
    private String title;
    private String content;
    private List<String> tags;
    private Long authorId;
    private String authorName;
    private Long likeCount;
    private Long commentCount;
    private Long viewCount;
    private LocalDateTime createdAt;
    private Double relevanceScore;
    private List<String> matchedTerms;
}
