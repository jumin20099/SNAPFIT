package com.snapfit.api.dto.search;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 검색 통계 DTO
 */
@Data
public class SearchStatisticsDto {

    private Long totalSearches;
    private Long todaySearches;
    private Long uniqueUsers;
    private List<String> topQueries;
    private Map<String, Long> searchByType;
    private Double averageSearchTime;
    private Long noResultSearches;
}
