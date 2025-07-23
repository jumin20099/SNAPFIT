package com.snapfit.api.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 사용자 코디(Outfit) 정보를 저장하는 엔티티.
 */
@Entity
@Table(name = "outfits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Outfit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long outfitIdx;

    /** 코디를 생성한 사용자 */
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_idx", nullable = false)
    private User user;

    /** 코디에 사용된 상품 정보(JSON) */
    @Column(name = "outfit_item", nullable = false, columnDefinition = "jsonb")
    private String outfitItem;

    /** 코디 미리보기 썸네일 URL */
    @Column(name = "outfit_thumbnail")
    private String outfitThumbnail;

    /** 공개 여부 (true = 공개) */
    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 