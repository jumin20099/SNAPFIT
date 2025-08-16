package com.snapfit.api.dto.scrap;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 스크랩 상태 응답 DTO
 */
@Data
public class ScrapStatusResponseDto {

    private Long postId;
    private Boolean isScrapped;
    private LocalDateTime scrapedAt;
}
