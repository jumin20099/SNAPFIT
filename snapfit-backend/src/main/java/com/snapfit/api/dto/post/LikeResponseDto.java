package com.snapfit.api.dto.post;

import lombok.Data;

/**
 * 게시글 좋아요 응답 DTO
 */
@Data
public class LikeResponseDto {

    private Long postId;
    private Boolean isLiked;
    private Long likeCount;
}
