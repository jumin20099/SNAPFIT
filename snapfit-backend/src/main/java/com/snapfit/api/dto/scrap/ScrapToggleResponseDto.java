package com.snapfit.api.dto.scrap;

import lombok.Data;

/**
 * 스크랩 토글 응답 DTO
 */
@Data
public class ScrapToggleResponseDto {

    private Long postId;
    private Boolean isScrapped;
    private Long scrapCount;
}
