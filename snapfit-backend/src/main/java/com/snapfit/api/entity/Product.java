package com.snapfit.api.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productIdx;

    private Long storeIdx; // 제휴몰(스토어) FK

    private String productName;
    private String productContent;
    private Integer productPrice;
    private String productImage;      // S3 URL (media 테이블의 url)
    private String productCategory;

    /** 대분류 카테고리 (예: 상의, 하의) */
    private String majorCategory;

    /** 세부 카테고리 (예: 맨투맨/스웨트) */
    private String subCategory;
    private String productLink;
    private Boolean isActive = true;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;

    public void setDeactivatedAt(LocalDateTime deactivatedAt) {
        this.deactivatedAt = deactivatedAt;
    }
}