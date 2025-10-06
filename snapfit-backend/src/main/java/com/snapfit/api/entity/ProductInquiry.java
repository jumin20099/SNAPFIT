package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_inquiries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInquiry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inquiry_id")
    private Long inquiryId;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_idx")
    private User user;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(name = "is_private")
    @Builder.Default
    private Boolean isPrivate = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private InquiryStatus status = InquiryStatus.OPEN;
    
    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answered_by", referencedColumnName = "user_idx")
    private User answeredBy;
    
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
    
    @Column(name = "anonymous_index")
    private Integer anonymousIndex;
    
    @Column(name = "anonymous_password_hash")
    private String anonymousPasswordHash;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum InquiryStatus {
        OPEN,       // 문의 등록
        ANSWERED,   // 답변 완료
        CLOSED      // 문의 종료
    }
    
    /**
     * 답변 여부 확인
     */
    public boolean isAnswered() {
        return status == InquiryStatus.ANSWERED || status == InquiryStatus.CLOSED;
    }
    
    /**
     * 답변 가능 여부 확인
     */
    public boolean canBeAnswered() {
        return status == InquiryStatus.OPEN;
    }
}
