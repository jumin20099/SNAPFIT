package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "anonymous_user_mapping", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "user_identifier"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnonymousUserMapping {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "post_id", nullable = false)
    private Long postId;
    
    @Column(name = "user_identifier", nullable = false, length = 255)
    private String userIdentifier; // IP 주소나 세션 ID 등
    
    @Column(name = "anonymous_index", nullable = false)
    private Integer anonymousIndex;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
