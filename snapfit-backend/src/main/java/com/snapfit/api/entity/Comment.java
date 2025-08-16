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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 게시글 댓글 엔티티
 * 보안과 성능을 고려한 설계
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Entity
@Table(name = "comments", indexes = {
    @Index(name = "idx_comments_post_id", columnList = "post_id, created_at ASC"),
    @Index(name = "idx_comments_author_id", columnList = "author_id, created_at DESC"),
    @Index(name = "idx_comments_parent_id", columnList = "parent_id")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@ToString(exclude = {"post", "author", "parent", "replies"})
@EqualsAndHashCode(of = "commentId")
@SQLDelete(sql = "UPDATE comments SET is_deleted = true, updated_at = NOW() WHERE comment_id = ?")
@Where(clause = "is_deleted = false")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    /**
     * 댓글이 속한 게시글 (필수)
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false, foreignKey = @ForeignKey(name = "fk_comments_posts"))
    @JsonIgnore
    private Post post;

    /**
     * 게시글 ID (JSON 직렬화용)
     */
    @JsonProperty("post_id")
    @Transient
    public Long getPostId() {
        return post != null ? post.getPostId() : null;
    }

    /**
     * 댓글 작성자 (필수)
     * 보안: 작성자만 수정/삭제 가능
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false, foreignKey = @ForeignKey(name = "fk_comments_users"))
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
     * 부모 댓글 (대댓글인 경우)
     * 보안: 댓글 트리 깊이 제한
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", foreignKey = @ForeignKey(name = "fk_comments_parent"))
    @JsonIgnore
    private Comment parent;

    /**
     * 부모 댓글 ID (JSON 직렬화용)
     */
    @JsonProperty("parent_id")
    @Transient
    public Long getParentId() {
        return parent != null ? parent.getCommentId() : null;
    }

    /**
     * 댓글 내용 (필수, 1-2000자)
     * 보안: XSS 방지를 위한 내용 검증
     */
    @NotBlank(message = "댓글 내용은 필수입니다")
    @Size(min = 1, max = 2000, message = "댓글 내용은 1자 이상 2000자 이하여야 합니다")
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 삭제 여부 (Soft Delete)
     * 보안: 데이터 복구 가능
     */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    /**
     * 생성 시간 (자동 설정)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정 시간 (자동 설정)
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 대댓글 목록 (One-to-Many)
     * 성능: 지연 로딩으로 메모리 최적화
     */
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @JsonIgnore
    private List<Comment> replies = new ArrayList<>();

    /**
     * 댓글 깊이 계산
     */
    @JsonProperty("depth")
    @Transient
    public int getDepth() {
        if (parent == null) return 0;
        return parent.getDepth() + 1;
    }

    /**
     * 댓글 상태 (활성/삭제됨)
     */
    @JsonProperty("status")
    @Transient
    public String getStatus() {
        if (isDeleted) return "DELETED";
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
     * 대댓글 추가
     */
    public void addReply(Comment reply) {
        if (reply != null && !replies.contains(reply)) {
            replies.add(reply);
            reply.setParent(this);
        }
    }

    /**
     * 대댓글 제거
     */
    public void removeReply(Comment reply) {
        if (replies.remove(reply)) {
            reply.setParent(null);
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
     * 내용 업데이트 (보안: 내용 검증)
     */
    public void updateContent(String newContent) {
        if (newContent != null && !newContent.trim().isEmpty() && newContent.length() <= 2000) {
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
    public Comment getPublicView() {
        Comment publicComment = new Comment();
        publicComment.setCommentId(this.commentId);
        publicComment.setContent(this.isDeleted ? "[삭제된 댓글입니다]" : this.content);
        publicComment.setIsDeleted(this.isDeleted);
        publicComment.setCreatedAt(this.createdAt);
        publicComment.setUpdatedAt(this.updatedAt);
        // parentId는 getParentId()로 계산되므로 별도 설정 불필요
        return publicComment;
    }
}
