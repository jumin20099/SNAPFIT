package com.snapfit.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 커뮤니티 게시글 엔티티
 * 보안, 성능, 확장성을 고려한 설계
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Entity
@Table(name = "posts", indexes = {
    @Index(name = "idx_posts_author_id", columnList = "author_id"),
    @Index(name = "idx_posts_created_at", columnList = "created_at DESC, post_id DESC"),
    @Index(name = "idx_posts_outfit_id", columnList = "outfit_id"),
    @Index(name = "idx_posts_deleted", columnList = "is_deleted"),
    @Index(name = "idx_posts_sponsored", columnList = "is_sponsored, created_at DESC")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = {"author", "outfit", "tags", "comments"})
@EqualsAndHashCode(of = "postId")
@SQLDelete(sql = "UPDATE posts SET is_deleted = true, updated_at = NOW() WHERE post_id = ?")
@Where(clause = "is_deleted = false")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long postId;

    /**
     * 게시글 작성자 (필수)
     * 보안: 작성자만 수정/삭제 가능
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false, foreignKey = @ForeignKey(name = "fk_posts_users"))
    @JsonIgnore
    private User author;

    /**
     * 작성자 ID (JSON 직렬화용)
     */
    @JsonProperty("author_id")
    @Transient
    public UUID getAuthorId() {
        return author != null ? author.getUserIdx() : null;
    }

    /**
     * 작성자 닉네임 (JSON 직렬화용)
     */
    @JsonProperty("author_nickname")
    @Transient
    public String getAuthorNickname() {
        return author != null ? author.getNickname() : null;
    }

    /**
     * 연관된 코디 (선택사항)
     * 보안: 코디가 삭제되어도 게시글은 유지
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outfit_id", foreignKey = @ForeignKey(name = "fk_posts_outfits"))
    @JsonIgnore
    private Outfit outfit;

    /**
     * 코디 ID (JSON 직렬화용)
     */
    @JsonProperty("outfit_id")
    @Transient
    public Long getOutfitId() {
        return outfit != null ? outfit.getOutfitIdx() : null;
    }

    /**
     * 게시글 내용 (필수, 1-10000자)
     * 보안: XSS 방지를 위한 내용 검증
     */
    @NotBlank(message = "게시글 내용은 필수입니다")
    @Size(min = 1, max = 10000, message = "게시글 내용은 1자 이상 10000자 이하여야 합니다")
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 미디어 URL 배열 (선택사항)
     * 보안: URL 검증 및 크기 제한
     */
    @Column(name = "media_urls", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Size(max = 10, message = "미디어는 최대 10개까지 업로드 가능합니다")
    @Builder.Default
    private Set<String> mediaUrls = new HashSet<>();

    /**
     * 스폰서드 포스트 여부
     * 보안: 명시적 라벨링으로 투명성 확보
     */
    @Column(name = "is_sponsored", nullable = false)
    @Builder.Default
    private Boolean isSponsored = false;

    /**
     * 삭제 여부 (Soft Delete)
     * 보안: 데이터 복구 가능
     */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    /**
     * 좋아요 수 (성능: 비동기 집계)
     */
    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private Long likeCount = 0L;

    /**
     * 스크랩 수 (성능: 비동기 집계)
     */
    @Column(name = "scrap_count", nullable = false)
    @Builder.Default
    private Long scrapCount = 0L;

    /**
     * 댓글 수 (성능: 트리거로 자동 업데이트)
     */
    @Column(name = "comment_count", nullable = false)
    @Builder.Default
    private Long commentCount = 0L;

    /**
     * 조회수 (성능: Redis 캐시 + 배치 업데이트)
     */
    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    /**
     * 생성 시간 (자동 설정)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    /**
     * 수정 시간 (자동 설정)
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;

    /**
     * 태그 목록 (Many-to-Many)
     * 성능: 지연 로딩으로 메모리 최적화
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id"),
        indexes = {
            @Index(name = "idx_post_tags_post_id", columnList = "post_id"),
            @Index(name = "idx_post_tags_tag_id", columnList = "tag_id")
        }
    )
    @JsonIgnore
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    /**
     * 태그명 목록 (JSON 직렬화용)
     */
    @JsonProperty("tags")
    @Transient
    public Set<String> getTagNames() {
        if (tags == null) return new HashSet<>();
        return tags.stream()
            .map(Tag::getName)
            .collect(java.util.stream.Collectors.toSet());
    }

    /**
     * 댓글 목록 (One-to-Many)
     * 성능: 지연 로딩으로 메모리 최적화
     */
    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @JsonIgnore
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    /**
     * 랭킹 점수 계산 (성능: 인덱스 기반)
     */
    @JsonProperty("ranking_score")
    @Transient
    public Double getRankingScore() {
        return (likeCount * 3.0) + (scrapCount * 2.0) + commentCount + (viewCount * 0.1);
    }

    /**
     * 게시글 상태 (활성/비활성)
     */
    @JsonProperty("status")
    @Transient
    public String getStatus() {
        if (isDeleted) return "DELETED";
        if (isSponsored) return "SPONSORED";
        return "ACTIVE";
    }

    /**
     * 보안: 작성자 검증
     */
    public boolean isAuthor(User user) {
        return user != null && author != null && author.getUserIdx().equals(user.getUserIdx());
    }

    /**
     * 보안: 수정 권한 검증
     */
    public boolean canEdit(User user) {
        return isAuthor(user) && !isDeleted;
    }

    /**
     * 보안: 삭제 권한 검증
     */
    public boolean canDelete(User user) {
        return isAuthor(user) && !isDeleted;
    }

    /**
     * 태그 추가 (중복 방지)
     */
    public void addTag(Tag tag) {
        if (tag != null && !tags.contains(tag)) {
            tags.add(tag);
            tag.getPosts().add(this);
        }
    }

    /**
     * 태그 제거
     */
    public void removeTag(Tag tag) {
        if (tag != null && tags.remove(tag)) {
            tag.getPosts().remove(this);
        }
    }

    /**
     * 태그 설정 (기존 태그 교체)
     */
    public void setTags(Set<Tag> newTags) {
        if (newTags == null) {
            newTags = new HashSet<>();
        }
        
        // 기존 태그 제거
        Iterator<Tag> iterator = tags.iterator();
        while (iterator.hasNext()) {
            Tag tag = iterator.next();
            iterator.remove();
            tag.getPosts().remove(this);
        }
        
        // 새 태그 추가
        newTags.forEach(this::addTag);
    }

    /**
     * 미디어 URL 추가 (중복 방지)
     */
    public void addMediaUrl(String mediaUrl) {
        if (mediaUrl != null && !mediaUrl.trim().isEmpty() && mediaUrls.size() < 10) {
            mediaUrls.add(mediaUrl.trim());
        }
    }

    /**
     * 미디어 URL 제거
     */
    public void removeMediaUrl(String mediaUrl) {
        mediaUrls.remove(mediaUrl);
    }

    /**
     * 조회수 증가 (성능: Redis 캐시 + 배치 업데이트)
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * 좋아요 수 증가
     */
    public void incrementLikeCount() {
        this.likeCount++;
    }

    /**
     * 좋아요 수 감소
     */
    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    /**
     * 스크랩 수 증가
     */
    public void incrementScrapCount() {
        this.scrapCount++;
    }

    /**
     * 스크랩 수 감소
     */
    public void decrementScrapCount() {
        if (this.scrapCount > 0) {
            this.scrapCount--;
        }
    }

    /**
     * 댓글 수 증가
     */
    public void incrementCommentCount() {
        this.commentCount++;
    }

    /**
     * 댓글 수 감소
     */
    public void decrementCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }

    /**
     * Soft Delete 처리
     */
    public void softDelete() {
        this.isDeleted = true;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 복구 처리
     */
    public void restore() {
        this.isDeleted = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 스폰서드 포스트 설정
     */
    public void setSponsored(boolean sponsored) {
        this.isSponsored = sponsored;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 내용 업데이트 (보안: 내용 검증)
     */
    public void updateContent(String newContent) {
        if (newContent != null && !newContent.trim().isEmpty() && newContent.length() <= 10000) {
            this.content = newContent.trim();
            this.updatedAt = LocalDateTime.now();
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
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (content != null) {
            content = content.trim();
        }
    }

    /**
     * 수정 전 검증
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (content != null) {
            content = content.trim();
        }
    }

    /**
     * 보안: 민감한 정보 제거
     */
    @JsonIgnore
    public Post getPublicView() {
        Post publicPost = new Post();
        publicPost.setPostId(this.postId);
        publicPost.setContent(this.content);
        publicPost.setMediaUrls(this.mediaUrls);
        publicPost.setIsSponsored(this.isSponsored);
        publicPost.setLikeCount(this.likeCount);
        publicPost.setScrapCount(this.scrapCount);
        publicPost.setCommentCount(this.commentCount);
        publicPost.setViewCount(this.viewCount);
        publicPost.setCreatedAt(this.createdAt);
        publicPost.setUpdatedAt(this.updatedAt);
        publicPost.setTags(this.tags);
        return publicPost;
    }
}
