package com.snapfit.api.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 상품/브랜드/코디 등 좋아요(및 싫어요) 기록.
 */
@Entity
@Table(name = "likes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Like {

    public enum TargetType {
        POST, OUTFIT, PRODUCT, OUTFIT_SHARE, COMMENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long likeIdx;

    /** 로그인 사용자의 좋아요인 경우 */
    @ManyToOne(optional = true)
    @JoinColumn(name = "user_idx")
    private User user;

    /** 비회원 식별용 */
    private String guestIdx;

    /** 좋아요 대상 PK */
    @Column(nullable = false)
    private Long targetIdx;

    /** 대상 타입(Enum) */
    @Column(name = "target_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    /** true = 좋아요, false = 싫어요 */
    @Column(name = "is_like", nullable = false)
    @Builder.Default
    private Boolean isLike = true;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
} 