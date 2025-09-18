package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "partner_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerProduct {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "partner_product_idx")
    private Long partnerProductIdx;
    
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
    
    // 수정 요청 관련 필드 (간단한 참조용)
    @Column(name = "has_pending_update_request")
    private Boolean hasPendingUpdateRequest = false;
    
    // 수정 요청 관계 매핑
    @OneToMany(mappedBy = "partnerProduct", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductUpdateRequest> updateRequests = new ArrayList<>();
    
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
    
} 