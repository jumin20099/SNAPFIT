package com.snapfit.api.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private UUID userIdx;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(nullable = false, unique = true)
    private String email;


    private String nickname;
    private String profileImage;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String providerId;

    /** 롤 기본값 USER */
    @Column(nullable = false)
    @Builder.Default
    private String role = "USER";

    /** 최초 저장 시 UUID와 타임스탬프 */
    @PrePersist
    public void prePersist() {
        if (this.userIdx == null) {
            this.userIdx = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /** 업데이트 시 타임스탬프 갱신 */
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
