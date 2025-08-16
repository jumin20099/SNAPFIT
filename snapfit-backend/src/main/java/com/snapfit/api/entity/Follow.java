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
 * 사용자 팔로우 엔티티
 * 사용자 간 팔로우/팔로잉 관계
 * 보안과 성능을 고려한 설계
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Entity
@Table(name = "follows", indexes = {
    @Index(name = "idx_follows_follower_id", columnList = "follower_id, created_at DESC"),
    @Index(name = "idx_follows_followee_id", columnList = "followee_id, created_at DESC")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = {"follower", "followee"})
@EqualsAndHashCode(of = {"followerId", "followeeId"})
public class Follow {

    /**
     * 복합 기본키: 팔로워 ID + 팔로이 ID
     * 보안: 중복 팔로우 방지
     */
    @EmbeddedId
    private FollowId id;

    /**
     * 팔로워 (팔로우하는 사용자)
     * 보안: 본인만 팔로우 관리 가능
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("followerId")
    @JoinColumn(name = "follower_id", nullable = false, foreignKey = @ForeignKey(name = "fk_follows_follower"))
    @JsonIgnore
    private User follower;

    /**
     * 팔로워 ID (JSON 직렬화용)
     */
    @JsonProperty("follower_id")
    @Transient
    public UUID getFollowerId() {
        return id != null ? id.getFollowerId() : null;
    }

    /**
     * 팔로이 (팔로우받는 사용자)
     * 보안: 차단된 사용자는 팔로우 불가
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("followeeId")
    @JoinColumn(name = "followee_id", nullable = false, foreignKey = @ForeignKey(name = "fk_follows_followee"))
    @JsonIgnore
    private User followee;

    /**
     * 팔로이 ID (JSON 직렬화용)
     */
    @JsonProperty("followee_id")
    @Transient
    public UUID getFolloweeId() {
        return id != null ? id.getFolloweeId() : null;
    }

    /**
     * 팔로우 생성 시간 (자동 설정)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 팔로우 상태 (활성/비활성)
     */
    @JsonProperty("status")
    @Transient
    public String getStatus() {
        // 차단된 사용자 체크 로직은 서비스 레이어에서 처리
        return "ACTIVE";
    }

    /**
     * 보안: 팔로우 소유자 검증
     */
    public boolean isOwner(User user) {
        return user != null && this.follower != null && this.follower.getUserIdx().equals(user.getUserIdx());
    }

    /**
     * 보안: 자기 자신 팔로우 방지
     */
    public boolean isValidFollow() {
        return follower != null && followee != null && !follower.getUserIdx().equals(followee.getUserIdx());
    }

    /**
     * 보안: 팔로우 가능 여부 검증
     */
    public boolean canFollow() {
        return isValidFollow() && follower != null && followee != null;
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
    public Follow getPublicView() {
        Follow publicFollow = new Follow();
        publicFollow.setId(this.id);
        publicFollow.setCreatedAt(this.createdAt);
        return publicFollow;
    }

    /**
     * 팔로우 ID 임베디드 클래스
     * 복합 기본키 구현
     */
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    @Builder
    @EqualsAndHashCode
    public static class FollowId implements java.io.Serializable {

        /**
         * 팔로워 ID
         */
        @Column(name = "follower_id", nullable = false)
        private UUID followerId;

        /**
         * 팔로이 ID
         */
        @Column(name = "followee_id", nullable = false)
        private UUID followeeId;

        /**
         * 보안: 유효성 검증
         */
        public boolean isValid() {
            return followerId != null && followeeId != null && !followerId.equals(followeeId);
        }

        /**
         * 보안: 자기 자신 팔로우 방지
         */
        public boolean isSelfFollow() {
            return followerId != null && followeeId != null && followerId.equals(followeeId);
        }
    }
}
