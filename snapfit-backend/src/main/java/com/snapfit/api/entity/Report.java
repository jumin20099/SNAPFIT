package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 신고 엔티티
 * 
 * @author SnapFit Team
 * @version 1.0
 */
@Entity
@Table(name = "reports", indexes = {
    @Index(name = "idx_reports_reporter_id", columnList = "reporter_id, created_at DESC"),
    @Index(name = "idx_reports_status", columnList = "status, created_at DESC"),
    @Index(name = "idx_reports_target", columnList = "target_type, target_id"),
    @Index(name = "idx_reports_updated_at", columnList = "updated_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = {"reporter"})
@EqualsAndHashCode(of = "reportId")
public class Report {

    /**
     * 신고 대상 타입
     */
    public enum TargetType {
        POST, COMMENT, USER
    }

    /**
     * 신고 상태
     */
    public enum Status {
        PENDING, PROCESSING, RESOLVED, REJECTED
    }

    /**
     * 신고 ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    /**
     * 신고하는 사용자 ID
     */
    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    /**
     * 신고하는 사용자 (지연 로딩)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", insertable = false, updatable = false)
    private User reporter;

    /**
     * 신고 대상 타입
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 16)
    private TargetType targetType;

    /**
     * 신고 대상 ID
     */
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    /**
     * 신고 사유
     */
    @Column(name = "reason", nullable = false, length = 100)
    private String reason;

    /**
     * 신고 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16)
    @Builder.Default
    private Status status = Status.PENDING;

    /**
     * 관리자 메모
     */
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    /**
     * 처리 완료 시간
     */
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /**
     * 생성 시간
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 수정 시간
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 게시글 신고 생성자
     */
    public static Report createPostReport(UUID reporterId, Long postId, String reason) {
        return Report.builder()
            .reporterId(reporterId)
            .targetType(TargetType.POST)
            .targetId(postId)
            .reason(reason)
            .status(Status.PENDING)
            .build();
    }

    /**
     * 댓글 신고 생성자
     */
    public static Report createCommentReport(UUID reporterId, Long commentId, String reason) {
        return Report.builder()
            .reporterId(reporterId)
            .targetType(TargetType.COMMENT)
            .targetId(commentId)
            .reason(reason)
            .status(Status.PENDING)
            .build();
    }

    /**
     * 사용자 신고 생성자
     */
    public static Report createUserReport(UUID reporterId, UUID targetUserId, String reason) {
        return Report.builder()
            .reporterId(reporterId)
            .targetType(TargetType.USER)
            .targetId(targetUserId.hashCode() + 0L) // UUID를 Long으로 변환 (임시)
            .reason(reason)
            .status(Status.PENDING)
            .build();
    }

    /**
     * 신고 승인
     */
    public void approve(String adminNotes) {
        this.status = Status.RESOLVED;
        this.adminNotes = adminNotes;
        this.resolvedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 신고 거부
     */
    public void reject(String adminNotes) {
        this.status = Status.REJECTED;
        this.adminNotes = adminNotes;
        this.resolvedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 신고 처리 시작
     */
    public void startProcessing() {
        this.status = Status.PROCESSING;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 처리 가능 여부 확인
     */
    public boolean canBeProcessed() {
        return status == Status.PENDING || status == Status.PROCESSING;
    }

    /**
     * 생성 전 검증
     */
    @PrePersist
    protected void onCreate() {
        if (reason != null) {
            reason = reason.trim();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    /**
     * 수정 전 검증
     */
    @PreUpdate
    protected void onUpdate() {
        if (reason != null) {
            reason = reason.trim();
        }
        updatedAt = LocalDateTime.now();
    }
}