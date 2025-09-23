package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "measurement_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "measurement_data", nullable = false, columnDefinition = "jsonb")
    private String measurementData; // 실측 데이터 JSON
    
    @Column(name = "change_reason", length = 100)
    private String changeReason; // 변경 사유
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum ChangeReason {
        DIRECT_INPUT("직접입력"),
        PURCHASE_BASED("구매후기반"),
        AUTO_UPDATE("자동업데이트"),
        ADMIN_UPDATE("관리자수정"),
        BULK_IMPORT("일괄가져오기");
        
        private final String description;
        
        ChangeReason(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
