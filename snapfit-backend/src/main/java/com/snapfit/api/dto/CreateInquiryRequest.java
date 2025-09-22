package com.snapfit.api.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class CreateInquiryRequest {
    
    @NotBlank(message = "문의 제목은 필수입니다")
    @Size(max = 255, message = "문의 제목은 255자 이하여야 합니다")
    private String title;
    
    @NotBlank(message = "문의 내용은 필수입니다")
    @Size(max = 2000, message = "문의 내용은 2000자 이하여야 합니다")
    private String content;
    
    @NotNull(message = "비공개 여부는 필수입니다")
    private Boolean isPrivate;
}
