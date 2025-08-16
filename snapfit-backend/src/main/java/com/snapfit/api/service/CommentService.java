package com.snapfit.api.service;

import com.snapfit.api.entity.Comment;
import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.CommentRepository;
import com.snapfit.api.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 댓글 서비스
 * 보안과 성능을 고려한 댓글 비즈니스 로직
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    private static final int MAX_COMMENT_LENGTH = 1000;
    private static final int MAX_REPLY_DEPTH = 3;

    /**
     * 댓글 생성
     * 보안: 입력 검증, 권한 확인, 중첩 댓글 깊이 제한
     */
    @Transactional
    public Comment createComment(Long postId, String content, User author, Long parentId) {
        log.info("댓글 생성 시작: 게시글={}, 작성자={}, 부모댓글={}", postId, author.getUserIdx(), parentId);
        
        try {
            // 게시글 존재 확인
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
            
            // 입력 검증
            validateCommentInput(content);
            
            // 부모 댓글 확인 및 깊이 검증
            Comment parentComment = null;
            if (parentId != null) {
                parentComment = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("부모 댓글을 찾을 수 없습니다"));
                
                // 부모 댓글과 같은 게시글인지 확인
                if (!parentComment.getPost().getPostId().equals(postId)) {
                    throw new RuntimeException("부모 댓글과 다른 게시글입니다");
                }
                
                // 중첩 댓글 깊이 확인
                int currentDepth = getCommentDepth(parentComment);
                if (currentDepth >= MAX_REPLY_DEPTH) {
                    throw new RuntimeException("최대 댓글 깊이를 초과했습니다");
                }
            }
            
            // 댓글 생성
            Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .content(content)
                .parent(parentComment)
                .createdAt(LocalDateTime.now())
                .build();
            
            Comment savedComment = commentRepository.save(comment);
            
            // 게시글 댓글 수 증가
            postRepository.incrementCommentCount(postId);
            
            log.info("댓글 생성 완료: ID={}", savedComment.getCommentId());
            return savedComment;
            
        } catch (Exception e) {
            log.error("댓글 생성 실패: 게시글={}, 작성자={}", postId, author.getUserIdx(), e);
            throw new RuntimeException("댓글 생성 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 댓글 수정
     * 보안: 소유자 확인, 입력 검증
     */
    @Transactional
    public Comment updateComment(Long commentId, String newContent, User user) {
        log.info("댓글 수정 시작: ID={}, 수정자={}", commentId, user.getUserIdx());
        
        try {
            Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다"));
            
            // 권한 확인
            if (!comment.getAuthor().getUserIdx().equals(user.getUserIdx())) {
                throw new RuntimeException("댓글 수정 권한이 없습니다");
            }
            
            // 입력 검증
            validateCommentInput(newContent);
            
            // 내용 업데이트
            comment.setContent(newContent);
            
            Comment updatedComment = commentRepository.save(comment);
            
            log.info("댓글 수정 완료: ID={}", commentId);
            return updatedComment;
            
        } catch (Exception e) {
            log.error("댓글 수정 실패: ID={}, 수정자={}", commentId, user.getUserIdx(), e);
            throw new RuntimeException("댓글 수정 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 댓글 삭제 (Soft Delete)
     * 보안: 소유자 확인, 연관 데이터 정리
     */
    @Transactional
    public void deleteComment(Long commentId, User user) {
        log.info("댓글 삭제 시작: ID={}, 삭제자={}", commentId, user.getUserIdx());
        
        try {
            Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다"));
            
            // 권한 확인
            if (!comment.getAuthor().getUserIdx().equals(user.getUserIdx())) {
                throw new RuntimeException("댓글 삭제 권한이 없습니다");
            }
            
            // Soft Delete
            commentRepository.delete(comment);
            
            // 게시글 댓글 수 감소
            postRepository.decrementCommentCount(comment.getPost().getPostId());
            
            log.info("댓글 삭제 완료: ID={}", commentId);
            
        } catch (Exception e) {
            log.error("댓글 삭제 실패: ID={}, 삭제자={}", commentId, user.getUserIdx(), e);
            throw new RuntimeException("댓글 삭제 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 댓글 조회
     * 성능: 단일 쿼리 최적화
     */
    public Comment getComment(Long commentId) {
        log.info("댓글 조회 시작: ID={}", commentId);
        
        try {
            Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다"));
            
            log.info("댓글 조회 완료: ID={}", commentId);
            return comment;
            
        } catch (Exception e) {
            log.error("댓글 조회 실패: ID={}", commentId, e);
            throw new RuntimeException("댓글 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글별 댓글 목록 조회 (최상위 댓글)
     * 성능: 페이징 최적화
     */
    public Page<Comment> getTopLevelComments(Long postId, Pageable pageable) {
        log.info("게시글 최상위 댓글 조회 시작: 게시글={}", postId);
        
        try {
            Page<Comment> comments = commentRepository.findTopLevelCommentsByPostId(postId, pageable);
            log.info("게시글 최상위 댓글 조회 완료: 게시글={}, {}개", postId, comments.getNumberOfElements());
            return comments;
            
        } catch (Exception e) {
            log.error("게시글 최상위 댓글 조회 실패: 게시글={}", postId, e);
            throw new RuntimeException("댓글 목록 조회 중 오류가 발생했습니다", e);
        }
    }



    /**
     * 사용자별 댓글 목록 조회
     * 성능: 페이징 최적화
     */
    public Page<Comment> getUserComments(UUID userId, Pageable pageable) {
        log.info("사용자 댓글 목록 조회 시작: 사용자={}", userId);
        
        try {
            Page<Comment> comments = commentRepository.findByAuthorIdOrderByCreatedAtDesc(userId, pageable);
            log.info("사용자 댓글 목록 조회 완료: 사용자={}, {}개", userId, comments.getNumberOfElements());
            return comments;
            
        } catch (Exception e) {
            log.error("사용자 댓글 목록 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("사용자 댓글 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 댓글 검색 (내용 기반)
     * 성능: pg_trgm 인덱스 활용
     */
    public Page<Comment> searchComments(String searchTerm, Pageable pageable) {
        log.info("댓글 검색 시작: 검색어={}", searchTerm);
        
        try {
            Page<Comment> comments = commentRepository.searchByContent(searchTerm, pageable);
            log.info("댓글 검색 완료: 검색어={}, {}개", searchTerm, comments.getNumberOfElements());
            return comments;
            
        } catch (Exception e) {
            log.error("댓글 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("댓글 검색 중 오류가 발생했습니다", e);
        }
    }



    /**
     * 댓글 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    public Map<String, Object> getCommentStatistics() {
        log.info("댓글 통계 조회 시작");
        
        try {
            Object[] stats = commentRepository.getCommentStatistics();
            
            Map<String, Object> statistics = Map.of(
                "totalComments", stats[0],
                "totalReplies", stats[1],
                "avgLikes", stats[2]
            );
            
            log.info("댓글 통계 조회 완료");
            return statistics;
            
        } catch (Exception e) {
            log.error("댓글 통계 조회 실패", e);
            throw new RuntimeException("댓글 통계 조회 중 오류가 발생했습니다", e);
        }
    }





    /**
     * 댓글 입력 검증
     * 보안: XSS 방지, 길이 제한
     */
    private void validateCommentInput(String content) {
        if (!StringUtils.hasText(content) || content.length() > MAX_COMMENT_LENGTH) {
            throw new RuntimeException("댓글 내용은 1-" + MAX_COMMENT_LENGTH + "자 사이여야 합니다");
        }
        
        // XSS 방지를 위한 기본적인 검증
        if (content.contains("<script>") || content.contains("javascript:")) {
            throw new RuntimeException("허용되지 않는 내용이 포함되어 있습니다");
        }
    }

    /**
     * 댓글 깊이 계산
     * 성능: 재귀 호출 최적화
     */
    private int getCommentDepth(Comment comment) {
        int depth = 0;
        Comment current = comment;
        
        while (current.getParent() != null) {
            depth++;
            current = current.getParent();
            
            // 무한 루프 방지
            if (depth > MAX_REPLY_DEPTH) {
                break;
            }
        }
        
        return depth;
    }


}
