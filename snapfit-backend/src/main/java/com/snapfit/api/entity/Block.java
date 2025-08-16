package com.snapfit.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 사용자 차단 엔티티
 * 사용자 간 차단/해제 관계
 * 보안과 성능을 고려한 설계
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Entity
@Table(name = "blocks", indexes = {
    @Index(name = "idx_blocks_blocker_id", columnList = "blocker_id"),
    @Index(name = "idx_blocks_blocked_user_id", columnList = "blocked_user_id")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = {"blocker", "blockedUser"})
@EqualsAndHashCode(of = "id")
public class Block {

    /**
     * 복합 기본키: 차단자 ID + 차단된 사용자 ID
     * 보안: 중복 차단 방지
     */
    @EmbeddedId
    private BlockId id;

    /**
     * 차단자 (차단하는 사용자)
     * 보안: 본인만 차단 관리 가능
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("blockerId")
    @JoinColumn(name = "blocker_id", nullable = false, foreignKey = @ForeignKey(name = "fk_blocks_blocker"))
    @JsonIgnore
    private User blocker;

    /**
     * 차단자 ID (JSON 직렬화용)
     */
    @JsonProperty("blocker_id")
    @Transient
    public UUID getBlockerId() {
        return id != null ? id.getBlockerId() : null;
    }

    /**
     * 차단된 사용자 (차단받는 사용자)
     * 보안: 차단된 사용자는 차단자에게 접근 불가
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("blockedUserId")
    @JoinColumn(name = "blocked_user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_blocks_blocked_user"))
    @JsonIgnore
    private User blockedUser;

    /**
     * 차단된 사용자 ID (JSON 직렬화용)
     */
    @JsonProperty("blocked_user_id")
    @Transient
    public UUID getBlockedUserId() {
        return id != null ? id.getBlockedUserId() : null;
    }

    /**
     * 차단 사유 (선택사항, 1-200자)
     * 보안: 차단 사유 길이 제한
     */
    @Size(max = 200, message = "차단 사유는 200자 이하여야 합니다")
    @Column(name = "reason", length = 200)
    private String reason;

    /**
     * 차단 생성 시간 (자동 설정)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 차단 상태 (활성/비활성)
     */
    @JsonProperty("status")
    @Transient
    public String getStatus() {
        return "ACTIVE";
    }

    /**
     * 보안: 차단자 검증
     */
    public boolean isBlocker(User user) {
        return user != null && this.blocker != null && this.blocker.getUserIdx().equals(user.getUserIdx());
    }

    /**
     * 보안: 차단된 사용자 검증
     */
    public boolean isBlockedUser(User user) {
        return user != null && this.blockedUser != null && this.blockedUser.getUserIdx().equals(user.getUserIdx());
    }

    /**
     * 보안: 자기 자신 차단 방지
     */
    public boolean isValidBlock() {
        return blocker != null && blockedUser != null && !blocker.getUserIdx().equals(blockedUser.getUserIdx());
    }

    /**
     * 보안: 차단 가능 여부 검증
     */
    public boolean canBlock() {
        return isValidBlock() && blocker != null && blockedUser != null;
    }

    /**
     * 보안: 차단 해제 권한 검증
     */
    public boolean canUnblock(User user) {
        return isBlocker(user);
    }

    /**
     * 차단 사유 설정
     */
    public void setBlockReason(String reason) {
        if (reason != null && reason.length() <= 200) {
            this.reason = reason.trim();
        }
    }

    /**
     * 생성 전 검증
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (reason != null) {
            reason = reason.trim();
        }
    }

    /**
     * 보안: 민감한 정보 제거
     */
    @JsonIgnore
    public Block getPublicView() {
        Block publicBlock = new Block();
        publicBlock.setId(this.id);
        publicBlock.setReason(this.reason);
        publicBlock.setCreatedAt(this.createdAt);
        return publicBlock;
    }

    /**
     * 차단 ID 임베디드 클래스
     * 복합 기본키 구현
     */
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    @Builder
    @EqualsAndHashCode
    public static class BlockId implements java.io.Serializable {

        /**
         * 차단자 ID
         */
        @Column(name = "blocker_id", nullable = false)
        private UUID blockerId;

        /**
         * 차단된 사용자 ID
         */
        @Column(name = "blocked_user_id", nullable = false)
        private UUID blockedUserId;

        /**
         * 보안: 유효성 검증
         */
        public boolean isValid() {
            return blockerId != null && blockedUserId != null && !blockerId.equals(blockedUserId);
        }

        /**
         * 보안: 자기 자신 차단 방지
         */
        public boolean isSelfBlock() {
            return blockerId != null && blockedUserId != null && blockerId.equals(blockedUserId);
        }
    }

    /**
     * 차단 기간 계산 (일 단위)
     * 성능: 차단 기간 통계
     */
    @JsonProperty("block_duration_days")
    @Transient
    public Long getBlockDurationDays() {
        if (createdAt == null) {
            return null;
        }
        
        long diffInDays = java.time.Duration.between(createdAt, LocalDateTime.now()).toDays();
        return diffInDays;
    }

    /**
     * 차단 우선순위 계산
     * 성능: 우선순위 기반 처리
     */
    @JsonProperty("priority")
    @Transient
    public int getPriority() {
        // 차단 사유가 있는 경우 우선순위 높음
        if (reason != null && !reason.trim().isEmpty()) {
            return 1;
        }
        
        // 차단 사유가 없는 경우 기본 우선순위
        return 2;
    }

    /**
     * 차단 영향도 계산
     * 성능: 차단 영향 분석
     */
    @JsonProperty("impact_level")
    @Transient
    public String getImpactLevel() {
        Long duration = getBlockDurationDays();
        
        if (duration == null) return "UNKNOWN";
        
        if (duration < 1) return "LOW";
        if (duration < 7) return "MEDIUM";
        if (duration < 30) return "HIGH";
        
        return "CRITICAL";
    }
}
