package com.snapfit.api.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

import java.util.List;

@Data
public class CreateReviewRequest {
    
    @NotNull(message = "평점은 필수입니다")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다")
    private Integer rating;
    
    @NotBlank(message = "리뷰 내용은 필수입니다")
    @Size(max = 1000, message = "리뷰 내용은 1000자 이하여야 합니다")
    private String content;
    
    @Size(max = 5, message = "이미지는 최대 5개까지 첨부할 수 있습니다")
    private List<String> images;
    
    private String anonymousPassword; // 익명 리뷰 비밀번호
}
