package com.snapfit.api.dto.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequestDto {
    
    @NotBlank(message = "댓글 내용은 필수입니다")
    private String content;
    
    private Long parentId; // 대댓글인 경우 부모 댓글 ID
    
    private String anonymousPassword; // 익명 댓글 비밀번호
}
