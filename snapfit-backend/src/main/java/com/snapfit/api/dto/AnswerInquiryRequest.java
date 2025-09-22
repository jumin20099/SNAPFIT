package com.snapfit.api.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class AnswerInquiryRequest {
    
    @NotBlank(message = "답변 내용은 필수입니다")
    @Size(max = 2000, message = "답변 내용은 2000자 이하여야 합니다")
    private String answer;
}
