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

    private String genderCategory;
    private String majorCategory;
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

    /**
     * 상품이 신상인지 판단 (등록한지 2주 이내)
     * @return 신상 여부
     */
    public boolean isNewProduct() {
        if (createdAt == null) {
            return false;
        }
        LocalDateTime twoWeeksAgo = LocalDateTime.now().minusWeeks(2);
        return createdAt.isAfter(twoWeeksAgo);
    }

    /**
     * 신상 카테고리가 포함된 세부 카테고리 반환
     * @return 신상이면 "신상" + 원래 카테고리, 아니면 원래 카테고리
     */
    public String getSubCategoryWithNew() {
        if (isNewProduct()) {
            return "신상";
        }
        return subCategory;
    }
}