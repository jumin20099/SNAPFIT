package com.snapfit.api.repository;

import com.snapfit.api.entity.Comment;
import com.snapfit.api.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 게시글의 댓글 조회 (대댓글 제외) - User 엔티티 함께 로드 (author가 null인 경우도 포함)
    @EntityGraph(attributePaths = {"author", "replies", "replies.author"})
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.author WHERE c.post = :post AND c.parent IS NULL ORDER BY c.createdAt DESC")
    Page<Comment> findByPostAndParentIsNullOrderByCreatedAtDesc(@Param("post") Post post, Pageable pageable);
    
    // 게시글의 댓글 조회 (인기순 정렬) - User 엔티티 함께 로드 (author가 null인 경우도 포함)
    @EntityGraph(attributePaths = {"author", "replies", "replies.author"})
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.author WHERE c.post = :post AND c.parent IS NULL ORDER BY c.likeCount DESC")
    Page<Comment> findByPostAndParentIsNullOrderByLikeCountDesc(@Param("post") Post post, Pageable pageable);
    
    // 게시글의 모든 댓글 조회 (대댓글 포함)
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);
    
    // 특정 댓글의 대댓글 조회
    List<Comment> findByParentOrderByCreatedAtAsc(Comment parent);
    
    // 게시글의 댓글 수 조회
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post = :post")
    Long countByPost(@Param("post") Post post);
}