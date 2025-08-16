package com.snapfit.api.dto.comment;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 댓글 응답 DTO
 */
@Data
public class CommentResponseDto {

    private Long commentId;
    private String content;
    private Long postId;
    private Long authorId;
    private String authorName;
    private String authorProfileImage;
    private Long parentCommentId;
    private Long likeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isLiked;
}
