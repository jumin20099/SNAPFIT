package com.snapfit.api.dto.comment;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentResponseDto {
    
    private Long commentId;
    private String content;
    private String authorName;
    private String authorProfileImage;
    private Long parentId;
    private Long likeCount;
    private Boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponseDto> replies;
}