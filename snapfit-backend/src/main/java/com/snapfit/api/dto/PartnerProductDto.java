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
    
    // 수정 요청 관련 필드들
    private String updateRequestStatus;
    private String updateRequestReason;
    private LocalDateTime updateRequestDate;
    
    // 원본 데이터 필드들
    private String originalProductName;
    private String originalProductContent;
    private String originalProductImage;
    private String originalProductLink;
    private String originalGenderCategory;
    private String originalMajorCategory;
    private String originalSubCategory;
    private Integer originalProductPrice;
    
    // 수정 요청 데이터 필드들
    private String requestedProductName;
    private String requestedProductContent;
    private String requestedProductImage;
    private String requestedProductLink;
    private String requestedGenderCategory;
    private String requestedMajorCategory;
    private String requestedSubCategory;
    private Integer requestedProductPrice;
} 