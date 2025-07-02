// com.snapfit.api.entity.Media.java
package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Media {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mediaRealName;   // 클라이언트 원본명
    private String mediaUidName;    // S3에 저장할 UUID 파일명
    private String mediaType;       // contentType
    private String mediaUrl;        // S3 public URL
    private String mediaPurpose;    // (예: "post", "profile" 등)
    private LocalDateTime createdAt = LocalDateTime.now();
}
