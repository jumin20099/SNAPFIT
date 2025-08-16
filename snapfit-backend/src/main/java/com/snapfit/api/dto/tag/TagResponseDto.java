package com.snapfit.api.dto.tag;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 태그 응답 DTO
 */
@Data
public class TagResponseDto {

    private Long tagId;
    private String name;
    private Long postCount;
    private Long popularity;
    private LocalDateTime createdAt;
}
