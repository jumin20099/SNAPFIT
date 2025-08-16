package com.snapfit.api.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 게시글 생성 요청 DTO
 */
@Data
public class CreatePostRequestDto {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    @Size(max = 10000, message = "내용은 10000자를 초과할 수 없습니다")
    private String content;

    @Size(max = 10, message = "태그는 최대 10개까지 가능합니다")
    private List<String> tags;

    @Size(max = 10, message = "이미지는 최대 10개까지 가능합니다")
    private List<String> mediaUrls;
}
