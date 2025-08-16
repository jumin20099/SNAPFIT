package com.snapfit.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 게시글 스크랩 엔티티
 * 사용자별 게시글 북마크 기능
 * 보안과 성능을 고려한 설계
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Entity
@Table(name = "scraps", indexes = {
    @Index(name = "idx_scraps_user_id", columnList = "user_id, created_at DESC"),
    @Index(name = "idx_scraps_post_id", columnList = "post_id")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = {"user", "post"})
@EqualsAndHashCode(of = "id")
public class Scrap {

    /**
     * 복합 기본키: 사용자 ID + 게시글 ID
     * 보안: 중복 스크랩 방지
     */
    @EmbeddedId
    private ScrapId id;

    /**
     * 스크랩한 사용자 (필수)
     * 보안: 본인만 스크랩 관리 가능
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_scraps_users"))
    @JsonIgnore
    private User user;

    /**
     * 사용자 ID (JSON 직렬화용)
     */
    @JsonProperty("user_id")
    @Transient
    public UUID getUserId() {
        return id != null ? id.getUserId() : null;
    }

    /**
     * 스크랩된 게시글 (필수)
     * 보안: 삭제된 게시글은 스크랩 불가
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("postId")
    @JoinColumn(name = "post_id", nullable = false, foreignKey = @ForeignKey(name = "fk_scraps_posts"))
    @JsonIgnore
    private Post post;

    /**
     * 게시글 ID (JSON 직렬화용)
     */
    @JsonProperty("post_id")
    @Transient
    public Long getPostId() {
        return id != null ? id.getPostId() : null;
    }

    /**
     * 스크랩 생성 시간 (자동 설정)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 스크랩 상태 (활성/비활성)
     */
    @JsonProperty("status")
    @Transient
    public String getStatus() {
        if (post != null && post.getIsDeleted()) {
            return "POST_DELETED";
        }
        return "ACTIVE";
    }

    /**
     * 보안: 스크랩 소유자 검증
     */
    public boolean isOwner(User user) {
        return user != null && this.user != null && this.user.getUserIdx().equals(user.getUserIdx());
    }

    /**
     * 보안: 스크랩 가능 여부 검증
     */
    public boolean canScrap() {
        return post != null && !post.getIsDeleted();
    }

    /**
     * 생성 전 검증
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /**
     * 보안: 민감한 정보 제거
     */
    @JsonIgnore
    public Scrap getPublicView() {
        Scrap publicScrap = new Scrap();
        publicScrap.setId(this.id);
        publicScrap.setCreatedAt(this.createdAt);
        return publicScrap;
    }

    /**
     * 스크랩 ID 임베디드 클래스
     * 복합 기본키 구현
     */
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    @Builder
    @EqualsAndHashCode
    public static class ScrapId implements java.io.Serializable {

        /**
         * 사용자 ID
         */
        @Column(name = "user_id", nullable = false)
        private UUID userId;

        /**
         * 게시글 ID
         */
        @Column(name = "post_id", nullable = false)
        private Long postId;

        /**
         * 보안: 유효성 검증
         */
        public boolean isValid() {
            return userId != null && postId != null && postId > 0;
        }
    }
}
