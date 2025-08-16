package com.snapfit.api.dto.search;

import lombok.Data;

import java.util.List;

/**
 * 통합 검색 결과 DTO
 */
@Data
public class SearchResultDto {

    private String query;
    private String type;
    private Long totalResults;
    private List<PostSearchResultDto> posts;
    private List<UserSearchResultDto> users;
    private List<TagSearchResultDto> tags;
    private Long searchTime;
}
