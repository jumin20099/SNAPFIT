package com.snapfit.api.dto.search;

import lombok.Data;

import java.util.List;

/**
 * 검색 자동완성 DTO
 */
@Data
public class SearchSuggestionDto {

    private String query;
    private List<String> suggestions;
    private List<String> popularQueries;
    private List<String> recentQueries;
}
