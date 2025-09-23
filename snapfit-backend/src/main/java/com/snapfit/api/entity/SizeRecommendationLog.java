package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "size_recommendation_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SizeRecommendationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
    
    @Column(name = "recommended_size", length = 20)
    private String recommendedSize; // 추천된 사이즈
    
    @Column(name = "confidence_score", precision = 3, scale = 2)
    private BigDecimal confidenceScore; // 신뢰도 점수 (0.00-1.00)
    
    @Column(name = "recommendation_reason", columnDefinition = "TEXT")
    private String recommendationReason; // 추천 근거
    
    @Column(name = "user_feedback")
    private Boolean userFeedback; // 사용자 피드백 (좋음/나쁨)
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // 신뢰도 점수 분류
    public String getConfidenceLevel() {
        if (confidenceScore == null) return "UNKNOWN";
        
        double score = confidenceScore.doubleValue();
        if (score >= 0.8) return "HIGH";
        if (score >= 0.6) return "MEDIUM";
        if (score >= 0.4) return "LOW";
        return "VERY_LOW";
    }
    
    // 피드백 상태
    public String getFeedbackStatus() {
        if (userFeedback == null) return "NO_FEEDBACK";
        return userFeedback ? "POSITIVE" : "NEGATIVE";
    }
}
