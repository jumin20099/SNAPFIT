package com.snapfit.api.dto.scrap;

import lombok.Data;

/**
 * 스크랩 통계 DTO
 */
@Data
public class ScrapStatisticsDto {

    private Long totalScrapCount;
    private Long todayScrapCount;
    private Long mostScrappedPostId;
    private String mostScrappedPostTitle;
    private Long mostScrappedPostScrapCount;
}
