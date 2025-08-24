package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 사용자 차단 엔티티
 * 
 * @author SnapFit Team
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
@EqualsAndHashCode(of = {"blockerId", "blockedUserId"})
@IdClass(Block.BlockId.class)
public class Block {

    /**
     * 복합 키 클래스
     */
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BlockId {
        @Column(name = "blocker_id")
        private UUID blockerId;
        
        @Column(name = "blocked_user_id")
        private UUID blockedUserId;
    }

    /**
     * 차단하는 사용자 ID
     */
    @Id
    @Column(name = "blocker_id", nullable = false)
    private UUID blockerId;

    /**
     * 차단당하는 사용자 ID
     */
    @Id
    @Column(name = "blocked_user_id", nullable = false)
    private UUID blockedUserId;

    /**
     * 차단하는 사용자 (지연 로딩)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocker_id", insertable = false, updatable = false)
    private User blocker;

    /**
     * 차단당하는 사용자 (지연 로딩)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_user_id", insertable = false, updatable = false)
    private User blockedUser;

    /**
     * 차단 사유 (선택사항)
     */
    @Column(name = "reason", length = 200)
    private String reason;

    /**
     * 생성 시간
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 생성자 (ID만)
     */
    public Block(UUID blockerId, UUID blockedUserId) {
        this.blockerId = blockerId;
        this.blockedUserId = blockedUserId;
    }

    /**
     * 생성자 (ID + 사유)
     */
    public Block(UUID blockerId, UUID blockedUserId, String reason) {
        this.blockerId = blockerId;
        this.blockedUserId = blockedUserId;
        this.reason = reason;
    }

    /**
     * 차단 검증
     */
    public boolean isValidBlock() {
        return blockerId != null && 
               blockedUserId != null && 
               !blockerId.equals(blockedUserId);
    }

    /**
     * 생성 전 검증
     */
    @PrePersist
    protected void onCreate() {
        if (!isValidBlock()) {
            throw new IllegalArgumentException("Invalid block: cannot block yourself or null users");
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}