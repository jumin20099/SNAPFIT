package com.snapfit.api.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 댓글 생성 요청 DTO
 */
@Data
public class CreateCommentRequestDto {

    @NotNull(message = "게시글 ID는 필수입니다")
    private Long postId;

    @NotBlank(message = "댓글 내용은 필수입니다")
    @Size(max = 1000, message = "댓글 내용은 1000자를 초과할 수 없습니다")
    private String content;

    private Long parentCommentId;
}
