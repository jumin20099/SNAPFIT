package com.snapfit.api.dto.search;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 태그 검색 결과 DTO
 */
@Data
public class TagSearchResultDto {

    private Long tagId;
    private String name;
    private Long postCount;
    private Long popularity;
    private LocalDateTime createdAt;
    private Double relevanceScore;
}
