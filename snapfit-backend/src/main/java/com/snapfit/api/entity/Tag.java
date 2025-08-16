package com.snapfit.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 게시글 태그 엔티티
 * 보안과 성능을 고려한 설계
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Entity
@Table(name = "tags", indexes = {
    @Index(name = "idx_tags_name", columnList = "name"),
    @Index(name = "idx_tags_post_count", columnList = "post_count DESC, created_at DESC")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = "posts")
@EqualsAndHashCode(of = "tagId")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    /**
     * 태그명 (필수, 1-50자, 영문/숫자/한글/_만 허용)
     * 보안: XSS 방지를 위한 정규식 검증
     */
    @NotBlank(message = "태그명은 필수입니다")
    @Size(min = 1, max = 50, message = "태그명은 1자 이상 50자 이하여야 합니다")
    @Pattern(regexp = "^[a-zA-Z0-9가-힣_]+$", message = "태그명은 영문, 숫자, 한글, 언더스코어만 사용 가능합니다")
    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    /**
     * 게시글 수 (자동 계산)
     * 성능: 트리거로 자동 업데이트
     */
    @Column(name = "post_count", nullable = false)
    @Builder.Default
    private Long postCount = 0L;

    /**
     * 생성 시간 (자동 설정)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 연관된 게시글 목록 (Many-to-Many)
     * 성능: 지연 로딩으로 메모리 최적화
     */
    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Post> posts = new HashSet<>();

    /**
     * 태그 인기도 계산 (게시글 수 기반)
     */
    @Formula("CASE WHEN post_count > 100 THEN 'HIGH' WHEN post_count > 50 THEN 'MEDIUM' ELSE 'LOW' END")
    @Transient
    public String getPopularity() {
        if (postCount > 100) return "HIGH";
        if (postCount > 50) return "MEDIUM";
        return "LOW";
    }

    /**
     * 태그 추가 (중복 방지)
     */
    public void addPost(Post post) {
        if (post != null && !posts.contains(post)) {
            posts.add(post);
            postCount++;
        }
    }

    /**
     * 태그 제거
     */
    public void removePost(Post post) {
        if (post != null && posts.remove(post)) {
            if (postCount > 0) {
                postCount--;
            }
        }
    }

    /**
     * 태그명 정규화 (소문자 변환)
     */
    public void normalizeName() {
        if (name != null) {
            this.name = name.toLowerCase().trim();
        }
    }

    /**
     * 생성 전 검증
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        normalizeName();
    }

    /**
     * 보안: 태그명 검증
     */
    public boolean isValidName() {
        return name != null && name.matches("^[a-zA-Z0-9가-힣_]+$") && name.length() <= 50;
    }
}
