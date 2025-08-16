package com.snapfit.api.dto.search;

import lombok.Data;

import java.util.List;

/**
 * 인기 검색어 DTO
 */
@Data
public class TrendingSearchDto {

    private List<String> trendingQueries;
    private List<String> trendingTags;
    private List<String> trendingUsers;
    private Long totalSearches;
    private Long uniqueSearchers;
}
