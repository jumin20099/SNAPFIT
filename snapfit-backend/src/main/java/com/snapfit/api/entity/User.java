// src/main/java/com/snapfit/api/entity/User.java
package com.snapfit.api.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")  // 설계도에 맞춰 복수형 사용
@Getter
@AllArgsConstructor
@Builder
@Setter
@NoArgsConstructor
public class User {

    @Id
    @Column(name = "user_idx", columnDefinition = "UUID")
    @Builder.Default
    private UUID userIdx = UUID.randomUUID();  // gen_random_uuid()와 동일

    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "provider", length = 20, nullable = false)
    private String provider;

    @Column(name = "provider_id", length = 100, nullable = false)
    private String providerId;

    @Column(name = "nickname", length = 50, nullable = false)
    private String nickname;

    @Column(name = "profile_image", columnDefinition = "TEXT")
    private String profileImage;

    @Column(name = "role", length = 20, nullable = false)
    @Builder.Default
    private String role = "USER";

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
