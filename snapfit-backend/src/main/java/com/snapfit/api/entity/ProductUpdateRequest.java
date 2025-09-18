package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_update_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "partner_product_id", nullable = false)
    private Long partnerProductId;
    
    // 원본 데이터 필드들
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
    
    // 수정 요청 관련 필드들
    @Column(name = "update_request_reason")
    private String updateRequestReason;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "update_request_status")
    @Builder.Default
    private UpdateRequestStatus updateRequestStatus = UpdateRequestStatus.PENDING_UPDATE;
    
    @Column(name = "update_request_date")
    private LocalDateTime updateRequestDate;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 관계 매핑
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_product_id", insertable = false, updatable = false)
    private PartnerProduct partnerProduct;
    
    // 수정 요청 상태 열거형
    public enum UpdateRequestStatus {
        PENDING_UPDATE,    // 수정 요청 대기
        APPROVED_UPDATE,   // 수정 요청 승인
        REJECTED_UPDATE,   // 수정 요청 거절
        CANCELLED_UPDATE   // 수정 요청 취소
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (updateRequestDate == null) {
            updateRequestDate = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
