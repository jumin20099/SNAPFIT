package com.snapfit.api.dto.post;

import lombok.Data;

/**
 * 익명 게시글 삭제 요청 DTO
 */
@Data
public class DeletePostRequestDto {
    private String anonymousPassword;
}
