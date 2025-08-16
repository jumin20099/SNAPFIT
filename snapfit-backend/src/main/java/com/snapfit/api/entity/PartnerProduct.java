package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "partner_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerProduct {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "store_idx", nullable = false)
    private Long storeIdx;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "product_content", nullable = false)
    private String productContent;
    
    @Column(name = "product_image", nullable = false)
    private String productImage;
    
    @Column(name = "product_link", nullable = false)
    private String productLink;
    
    @Column(name = "product_category", nullable = false)
    private String productCategory;

    @Column(name = "gender_category")
    private String genderCategory;

    @Column(name = "major_category")
    private String majorCategory;

    @Column(name = "sub_category")
    private String subCategory;
    
    @Column(name = "product_price", nullable = false)
    private Integer productPrice;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProductStatus status;
    
    @Column(name = "partner_application_id")
    private Long partnerApplicationId;
    
    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;
    
    // 수정 요청 관련 필드들
    @Column(name = "original_product_name")
    private String originalProductName;
    
    @Column(name = "original_product_content")
    private String originalProductContent;
    
    @Column(name = "original_product_image")
    private String originalProductImage;
    
    @Column(name = "original_product_link")
    private String originalProductLink;
    
    @Column(name = "original_gender_category")
    private String originalGenderCategory;
    
    @Column(name = "original_major_category")
    private String originalMajorCategory;
    
    @Column(name = "original_sub_category")
    private String originalSubCategory;
    
    @Column(name = "original_product_price")
    private Integer originalProductPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "update_request_status")
    private UpdateRequestStatus updateRequestStatus = UpdateRequestStatus.NO_UPDATE;
    
    @Column(name = "update_request_reason")
    private String updateRequestReason;
    
    @Column(name = "update_request_date")
    private LocalDateTime updateRequestDate;
    
    // 요청된 데이터 필드들
    @Column(name = "requested_product_name")
    private String requestedProductName;
    
    @Column(name = "requested_product_content")
    private String requestedProductContent;
    
    @Column(name = "requested_product_image")
    private String requestedProductImage;
    
    @Column(name = "requested_product_link")
    private String requestedProductLink;
    
    @Column(name = "requested_gender_category")
    private String requestedGenderCategory;
    
    @Column(name = "requested_major_category")
    private String requestedMajorCategory;
    
    @Column(name = "requested_sub_category")
    private String requestedSubCategory;
    
    @Column(name = "requested_product_price")
    private Integer requestedProductPrice;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (submittedDate == null) {
            submittedDate = LocalDateTime.now();
        }
        if (status == null) {
            status = ProductStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ProductStatus {
        PENDING,    // 승인 대기
        APPROVED,   // 승인됨
        REJECTED    // 거절됨
    }
    
    public enum UpdateRequestStatus {
        NO_UPDATE,      // 수정 요청 없음
        PENDING_UPDATE, // 수정 요청 대기
        APPROVED_UPDATE, // 수정 승인됨
        REJECTED_UPDATE  // 수정 거절됨
    }
} 