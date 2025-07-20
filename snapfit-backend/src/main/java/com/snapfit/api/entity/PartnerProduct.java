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
        PENDING,    // 대기중
        APPROVED,   // 승인
        REJECTED    // 거절
    }
} 