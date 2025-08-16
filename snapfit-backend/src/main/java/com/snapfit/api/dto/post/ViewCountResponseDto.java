package com.snapfit.api.dto.post;

import lombok.Data;

/**
 * 게시글 조회수 응답 DTO
 */
@Data
public class ViewCountResponseDto {

    private Long postId;
    private Long viewCount;
}
