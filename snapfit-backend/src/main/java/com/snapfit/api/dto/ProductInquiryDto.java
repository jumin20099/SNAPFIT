package com.snapfit.api.dto;

import com.snapfit.api.entity.ProductInquiry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInquiryDto {
    
    private Long inquiryId;
    private Long productId;
    private UUID userId;
    private String userNickname;
    private String userProfileImage;
    private String title;
    private String content;
    private Boolean isPrivate;
    private ProductInquiry.InquiryStatus status;
    private String answer;
    private UUID answeredBy;
    private String answeredByNickname;
    private LocalDateTime answeredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean canBeAnswered; // 현재 사용자가 답변할 수 있는지 여부
}
