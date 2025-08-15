package com.snapfit.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerProductDto {
    
    private Long id;
    private Long storeIdx;  // store_idx 필드 추가
    private String productName;
    private String productContent;
    private String productImage;
    private String productLink;
    private String productCategory;

    private String genderCategory;
    private String majorCategory;
    private String subCategory;
    private Integer productPrice;
    private String status;
    private Long partnerApplicationId;
    private String partnerCompanyName;
    private Boolean isActive;
    private String rejectionReason;
    private LocalDateTime submittedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    


    // 조회수 지표 (제휴사 노출)
    private Long viewCount;          // 누적 조회수
    private Long actualViewCount;    // 실제 조회수(12h 중복 방지)
} 