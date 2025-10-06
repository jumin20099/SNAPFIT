package com.snapfit.api.repository;

import com.snapfit.api.entity.Comment;
import com.snapfit.api.entity.CommentLike;
import com.snapfit.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    
    // 사용자가 특정 댓글에 좋아요를 눌렀는지 확인
    Optional<CommentLike> findByCommentAndUser(Comment comment, User user);
    
    // 댓글의 좋아요 수 조회
    Long countByComment(Comment comment);
    
    // 사용자가 특정 댓글의 좋아요를 삭제
    void deleteByCommentAndUser(Comment comment, User user);
    
    // 익명 사용자가 특정 댓글에 좋아요를 눌렀는지 확인
    Optional<CommentLike> findByCommentAndAnonymousIndex(Comment comment, Integer anonymousIndex);
    
    // 익명 사용자가 특정 댓글의 좋아요를 삭제
    void deleteByCommentAndAnonymousIndex(Comment comment, Integer anonymousIndex);
}
