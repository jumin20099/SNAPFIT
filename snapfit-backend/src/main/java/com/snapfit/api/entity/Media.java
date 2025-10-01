// com.snapfit.api.entity.Media.java
package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Media {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String mediaRealName;   // 클라이언트 원본명
    
    @Column(length = 500)
    private String mediaUidName;    // S3에 저장할 UUID 파일명
    
    @Column(length = 255)
    private String mediaType;       // contentType
    
    @Column(length = 1000)
    private String mediaUrl;        // S3 public URL
    
    @Column(length = 100)
    private String mediaPurpose;    // (예: "post", "profile" 등)

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
