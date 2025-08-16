package com.snapfit.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 신고 엔티티
 * 게시글, 댓글, 사용자 신고 처리
 * 보안과 성능을 고려한 설계
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Entity
@Table(name = "reports", indexes = {
    @Index(name = "idx_reports_target", columnList = "target_type, target_id"),
    @Index(name = "idx_reports_reporter_id", columnList = "reporter_id, created_at DESC"),
    @Index(name = "idx_reports_status", columnList = "status, created_at DESC")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = "reporter")
@EqualsAndHashCode(of = "reportId")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    /**
     * 신고자 (필수)
     * 보안: 본인만 신고 조회 가능
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reports_users"))
    @JsonIgnore
    private User reporter;

    /**
     * 신고자 ID (JSON 직렬화용)
     */
    @JsonProperty("reporter_id")
    @Transient
    public UUID getReporterId() {
        return reporter != null ? reporter.getUserIdx() : null;
    }

    /**
     * 신고 대상 타입 (필수)
     * 보안: 허용된 대상 타입만 신고 가능
     */
    @NotNull(message = "신고 대상 타입은 필수입니다")
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 16)
    private TargetType targetType;

    /**
     * 신고 대상 ID (필수)
     * 예: 게시글 ID, 댓글 ID, 사용자 ID 등
     */
    @NotNull(message = "신고 대상 ID는 필수입니다")
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    /**
     * 신고 사유 (필수, 1-100자)
     * 보안: 신고 사유 길이 제한 및 검증
     */
    @NotBlank(message = "신고 사유는 필수입니다")
    @Size(min = 1, max = 100, message = "신고 사유는 1자 이상 100자 이하여야 합니다")
    @Column(name = "reason", nullable = false, length = 100)
    private String reason;

    /**
     * 신고 상태 (기본값: PENDING)
     * 보안: 신고 처리 상태 추적
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    /**
     * 관리자 메모 (선택사항)
     * 보안: 관리자만 수정 가능
     */
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    /**
     * 해결 시간 (신고 처리 완료 시)
     * 성능: 처리 시간 통계
     */
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /**
     * 생성 시간 (자동 설정)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정 시간 (자동 설정)
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 신고 상태 (활성/처리됨/거부됨)
     */
    @JsonProperty("status_description")
    @Transient
    public String getStatusDescription() {
        switch (status) {
            case PENDING:
                return "대기중";
            case PROCESSING:
                return "처리중";
            case RESOLVED:
                return "처리완료";
            case REJECTED:
                return "거부됨";
            default:
                return "알 수 없음";
        }
    }

    /**
     * 보안: 신고자 검증
     */
    public boolean isReporter(User user) {
        return user != null && reporter != null && reporter.getUserIdx().equals(user.getUserIdx());
    }

    /**
     * 보안: 신고 조회 권한 검증
     */
    public boolean canRead(User user) {
        return isReporter(user) || (user != null && user.getRole() == User.Role.ADMIN);
    }

    /**
     * 보안: 신고 수정 권한 검증
     */
    public boolean canUpdate(User user) {
        return isReporter(user) || (user != null && user.getRole() == User.Role.ADMIN);
    }

    /**
     * 신고 처리 시작
     */
    public void startProcessing() {
        this.status = ReportStatus.PROCESSING;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 신고 처리 완료
     */
    public void resolve(String notes) {
        this.status = ReportStatus.RESOLVED;
        this.adminNotes = notes;
        this.resolvedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 신고 거부
     */
    public void reject(String notes) {
        this.status = ReportStatus.REJECTED;
        this.adminNotes = notes;
        this.resolvedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 생성 전 검증
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ReportStatus.PENDING;
        }
        if (reason != null) {
            reason = reason.trim();
        }
    }

    /**
     * 수정 전 검증
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (reason != null) {
            reason = reason.trim();
        }
    }

    /**
     * 보안: 민감한 정보 제거
     */
    @JsonIgnore
    public Report getPublicView() {
        Report publicReport = new Report();
        publicReport.setReportId(this.reportId);
        publicReport.setTargetType(this.targetType);
        publicReport.setTargetId(this.targetId);
        publicReport.setReason(this.reason);
        publicReport.setStatus(this.status);
        publicReport.setCreatedAt(this.createdAt);
        publicReport.setUpdatedAt(this.updatedAt);
        return publicReport;
    }

    /**
     * 신고 대상 타입 열거형
     * 보안: 허용된 대상 타입만 정의
     */
    public enum TargetType {
        POST("게시글"),
        COMMENT("댓글"),
        USER("사용자");

        private final String description;

        TargetType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }

        /**
         * 보안: 유효한 대상 타입 검증
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
     * 신고 상태 열거형
     * 보안: 신고 처리 상태 추적
     */
    public enum ReportStatus {
        PENDING("대기중"),
        PROCESSING("처리중"),
        RESOLVED("처리완료"),
        REJECTED("거부됨");

        private final String description;

        ReportStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }

        /**
         * 보안: 유효한 상태 검증
         */
        public static boolean isValid(String status) {
            try {
                valueOf(status);
                return true;
            } catch (IllegalArgumentException e) {
                return false;
            }
        }
    }

    /**
     * 신고 처리 시간 계산 (분 단위)
     * 성능: 처리 시간 통계
     */
    @JsonProperty("processing_time_minutes")
    @Transient
    public Long getProcessingTimeMinutes() {
        if (resolvedAt == null || createdAt == null) {
            return null;
        }
        
        long diffInMinutes = java.time.Duration.between(createdAt, resolvedAt).toMinutes();
        return diffInMinutes;
    }

    /**
     * 신고 우선순위 계산
     * 성능: 우선순위 기반 처리
     */
    @JsonProperty("priority")
    @Transient
    public int getPriority() {
        // 시스템 신고는 최우선
        if (targetType == TargetType.USER) {
            return 1;
        }
        
        // 게시글 신고는 댓글 신고보다 우선
        if (targetType == TargetType.POST) {
            return 2;
        }
        
        // 댓글 신고
        if (targetType == TargetType.COMMENT) {
            return 3;
        }
        
        return 4;
    }
}
