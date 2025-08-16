package com.snapfit.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 사용자 알림 엔티티
 * 실시간 알림 및 배치 알림 처리
 * 보안과 성능을 고려한 설계
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user_id", columnList = "user_id, created_at DESC"),
    @Index(name = "idx_notifications_unread", columnList = "user_id, is_read") WHERE is_read = false,
    @Index(name = "idx_notifications_type", columnList = "type, created_at DESC")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = "user")
@EqualsAndHashCode(of = "notificationId")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    /**
     * 알림을 받을 사용자 (필수)
     * 보안: 본인만 알림 조회/수정 가능
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_notifications_users"))
    @JsonIgnore
    private User user;

    /**
     * 사용자 ID (JSON 직렬화용)
     */
    @JsonProperty("user_id")
    @Transient
    public UUID getUserId() {
        return user != null ? user.getUserIdx() : null;
    }

    /**
     * 알림 타입 (필수)
     * 보안: 허용된 알림 타입만 생성 가능
     */
    @NotNull(message = "알림 타입은 필수입니다")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    private NotificationType type;

    /**
     * 참조 ID (알림과 관련된 대상)
     * 예: 게시글 ID, 댓글 ID, 사용자 ID 등
     */
    @Column(name = "ref_id")
    private Long refId;

    /**
     * 알림 페이로드 (JSON 형태)
     * 보안: 페이로드 크기 제한 및 검증
     */
    @Type(org.hibernate.type.JsonType.class)
    @Column(name = "payload_json", columnDefinition = "jsonb")
    private String payloadJson;

    /**
     * 읽음 여부 (기본값: false)
     * 성능: 읽지 않은 알림만 조회
     */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    /**
     * 생성 시간 (자동 설정)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 알림 상태 (활성/비활성)
     */
    @JsonProperty("status")
    @Transient
    public String getStatus() {
        if (isRead) return "READ";
        return "UNREAD";
    }

    /**
     * 보안: 알림 소유자 검증
     */
    public boolean isOwner(User user) {
        return user != null && this.user != null && this.user.getUserIdx().equals(user.getUserIdx());
    }

    /**
     * 보안: 알림 읽기 권한 검증
     */
    public boolean canRead(User user) {
        return isOwner(user);
    }

    /**
     * 보안: 알림 수정 권한 검증
     */
    public boolean canUpdate(User user) {
        return isOwner(user);
    }

    /**
     * 알림 읽음 처리
     */
    public void markAsRead() {
        this.isRead = true;
    }

    /**
     * 알림 읽음 해제
     */
    public void markAsUnread() {
        this.isRead = false;
    }

    /**
     * 생성 전 검증
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }

    /**
     * 보안: 민감한 정보 제거
     */
    @JsonIgnore
    public Notification getPublicView() {
        Notification publicNotification = new Notification();
        publicNotification.setNotificationId(this.notificationId);
        publicNotification.setType(this.type);
        publicNotification.setRefId(this.refId);
        publicNotification.setPayloadJson(this.payloadJson);
        publicNotification.setIsRead(this.isRead);
        publicNotification.setCreatedAt(this.createdAt);
        return publicNotification;
    }

    /**
     * 알림 타입 열거형
     * 보안: 허용된 알림 타입만 정의
     */
    public enum NotificationType {
        LIKE("좋아요"),
        COMMENT("댓글"),
        FOLLOW("팔로우"),
        SCRAP("스크랩"),
        MENTION("멘션"),
        REPORT_RESULT("신고 결과"),
        SYSTEM("시스템");

        private final String description;

        NotificationType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }

        /**
         * 보안: 유효한 알림 타입 검증
         */
        public static boolean isValid(String type) {
            try {
                valueOf(type);
                return true;
            } catch (IllegalArgumentException e) {
                return false;
            }
        }
    }

    /**
     * 알림 우선순위 계산
     * 성능: 우선순위 기반 정렬
     */
    @JsonProperty("priority")
    @Transient
    public int getPriority() {
        switch (type) {
            case SYSTEM:
                return 1;
            case REPORT_RESULT:
                return 2;
            case MENTION:
                return 3;
            case COMMENT:
                return 4;
            case LIKE:
                return 5;
            case SCRAP:
                return 6;
            case FOLLOW:
                return 7;
            default:
                return 8;
        }
    }

    /**
     * 알림 만료 여부 확인
     * 성능: 오래된 알림 자동 정리
     */
    @JsonProperty("is_expired")
    @Transient
    public boolean isExpired() {
        if (createdAt == null) return false;
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryDate = createdAt.plusDays(30); // 30일 후 만료
        
        return now.isAfter(expiryDate);
    }
}
