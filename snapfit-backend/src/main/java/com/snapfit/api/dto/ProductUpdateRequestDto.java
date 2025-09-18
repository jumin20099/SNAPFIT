package com.snapfit.api.dto;

import com.snapfit.api.entity.ProductUpdateRequest;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateRequestDto {
    
    private Long id;
    private Long partnerProductId;
    
    // 원본 데이터
    private String originalProductName;
    private String originalProductContent;
    private String originalProductImage;
    private String originalProductLink;
    private String originalGenderCategory;
    private String originalMajorCategory;
    private String originalSubCategory;
    private Integer originalProductPrice;
    
    // 요청된 데이터
    private String requestedProductName;
    private String requestedProductContent;
    private String requestedProductImage;
    private String requestedProductLink;
    private String requestedGenderCategory;
    private String requestedMajorCategory;
    private String requestedSubCategory;
    private Integer requestedProductPrice;
    
    // 수정 요청 정보
    private String updateRequestReason;
    private ProductUpdateRequest.UpdateRequestStatus updateRequestStatus;
    private LocalDateTime updateRequestDate;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 상품 정보 (조인된 데이터)
    private String productName;
    private String productContent;
    private String productImage;
    private String productLink;
    private String genderCategory;
    private String majorCategory;
    private String subCategory;
    private Integer productPrice;
    private String partnerCompanyName;
}
