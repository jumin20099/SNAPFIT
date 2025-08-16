package com.snapfit.api.dto.comment;

import lombok.Data;

/**
 * 댓글 좋아요 응답 DTO
 */
@Data
public class CommentLikeResponseDto {

    private Long commentId;
    private Boolean isLiked;
    private Long likeCount;
}
