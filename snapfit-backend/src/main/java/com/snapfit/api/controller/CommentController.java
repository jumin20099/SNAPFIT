package com.snapfit.api.controller;

import com.snapfit.api.dto.comment.CommentRequestDto;
import com.snapfit.api.dto.comment.CommentResponseDto;
import com.snapfit.api.entity.Comment;
import com.snapfit.api.entity.CommentLike;
import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.CommentLikeRepository;
import com.snapfit.api.repository.CommentRepository;
import com.snapfit.api.repository.PostRepository;
import com.snapfit.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Slf4j
public class CommentController {
    
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    // 댓글 작성
    @PostMapping("/posts/{postId}")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequestDto request) {
        
        try {
            // 게시글 조회
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + postId));
            
            // 작성자 조회 (임시로 고정 사용자 사용)
            User author = userRepository.findByEmail("temp@test.com")
                    .orElseGet(() -> {
                        User tempUser = new User();
                        tempUser.setNickname("임시사용자");
                        tempUser.setEmail("temp@test.com");
                        tempUser.setProvider("test");
                        tempUser.setProviderId("test-id");
                        return userRepository.save(tempUser);
                    });
            
            // 댓글 생성
            Comment comment = Comment.builder()
                    .post(post)
                    .author(author)
                    .content(request.getContent())
                    .likeCount(0L)
                    .build();
            
            // 대댓글인 경우 부모 댓글 설정
            if (request.getParentId() != null) {
                Comment parent = commentRepository.findById(request.getParentId())
                        .orElseThrow(() -> new RuntimeException("부모 댓글을 찾을 수 없습니다: " + request.getParentId()));
                comment.setParent(parent);
            }
            
            Comment savedComment = commentRepository.save(comment);
            
            // 댓글 수 업데이트
            updateCommentCount(postId);
            
            CommentResponseDto response = convertToDto(savedComment, author);
            log.info("댓글 생성 성공: commentId={}, postId={}", savedComment.getCommentId(), postId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("댓글 생성 실패", e);
            throw new RuntimeException("댓글 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 게시글의 댓글 목록 조회
    @GetMapping("/posts/{postId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CommentResponseDto>> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + postId));
            
            // 작성자 조회 (임시로 고정 사용자 사용)
            User currentUser = userRepository.findByEmail("temp@test.com")
                    .orElseGet(() -> {
                        User tempUser = new User();
                        tempUser.setNickname("임시사용자");
                        tempUser.setEmail("temp@test.com");
                        tempUser.setProvider("test");
                        tempUser.setProviderId("test-id");
                        return userRepository.save(tempUser);
                    });
            
            // 댓글 조회 (대댓글 제외)
            Pageable pageable = PageRequest.of(page, size);
            Page<Comment> comments = commentRepository.findByPostAndParentIsNullOrderByCreatedAtDesc(post, pageable);
            
            List<CommentResponseDto> response = comments.getContent().stream()
                    .map(comment -> convertToDtoWithReplies(comment, currentUser))
                    .collect(Collectors.toList());
            
            log.info("댓글 목록 조회 성공: postId={}, count={}", postId, response.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("댓글 목록 조회 실패", e);
            throw new RuntimeException("댓글 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 댓글 좋아요 토글
    @PostMapping("/{commentId}/like")
    public ResponseEntity<CommentResponseDto> toggleLike(@PathVariable Long commentId) {
        
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다: " + commentId));
            
            // 작성자 조회 (임시로 고정 사용자 사용)
            User currentUser = userRepository.findByEmail("temp@test.com")
                    .orElseGet(() -> {
                        User tempUser = new User();
                        tempUser.setNickname("임시사용자");
                        tempUser.setEmail("temp@test.com");
                        tempUser.setProvider("test");
                        tempUser.setProviderId("test-id");
                        return userRepository.save(tempUser);
                    });
            
            // 좋아요 상태 확인
            boolean isLiked = commentLikeRepository.findByCommentAndUser(comment, currentUser).isPresent();
            
            if (isLiked) {
                // 좋아요 취소
                commentLikeRepository.deleteByCommentAndUser(comment, currentUser);
                comment.setLikeCount(comment.getLikeCount() - 1);
            } else {
                // 좋아요 추가
                CommentLike commentLike = CommentLike.builder()
                        .comment(comment)
                        .user(currentUser)
                        .build();
                commentLikeRepository.save(commentLike);
                comment.setLikeCount(comment.getLikeCount() + 1);
            }
            
            commentRepository.save(comment);
            
            CommentResponseDto response = convertToDto(comment, currentUser);
            log.info("댓글 좋아요 토글 성공: commentId={}, liked={}", commentId, !isLiked);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("댓글 좋아요 토글 실패", e);
            throw new RuntimeException("댓글 좋아요 토글 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다: " + commentId));
            
            // 댓글 삭제 (대댓글도 함께 삭제됨 - cascade 설정)
            commentRepository.delete(comment);
            
            // 댓글 수 업데이트
            updateCommentCount(comment.getPost().getPostId());
            
            log.info("댓글 삭제 성공: commentId={}", commentId);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("댓글 삭제 실패", e);
            throw new RuntimeException("댓글 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // DTO 변환
    private CommentResponseDto convertToDto(Comment comment, User currentUser) {
        CommentResponseDto dto = new CommentResponseDto();
        dto.setCommentId(comment.getCommentId());
        dto.setContent(comment.getContent());
        dto.setAuthorName(comment.getAuthor().getNickname());
        dto.setAuthorProfileImage(comment.getAuthor().getProfileImage() != null ? comment.getAuthor().getProfileImage() : "/placeholder.svg");
        dto.setParentId(comment.getParent() != null ? comment.getParent().getCommentId() : null);
        dto.setLikeCount(comment.getLikeCount());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        
        // 현재 사용자의 좋아요 상태 확인
        boolean isLiked = commentLikeRepository.findByCommentAndUser(comment, currentUser).isPresent();
        dto.setIsLiked(isLiked);
        
        return dto;
    }
    
    // DTO 변환 (대댓글 포함)
    private CommentResponseDto convertToDtoWithReplies(Comment comment, User currentUser) {
        CommentResponseDto dto = convertToDto(comment, currentUser);
        
        // 대댓글 변환
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentResponseDto> replies = comment.getReplies().stream()
                    .map(reply -> convertToDto(reply, currentUser))
                    .collect(Collectors.toList());
            dto.setReplies(replies);
        }
        
        return dto;
    }
    
    // 게시글의 댓글 수 업데이트
    private void updateCommentCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + postId));
        
        Long commentCount = commentRepository.countByPost(post);
        post.setCommentCount(commentCount);
        postRepository.save(post);
    }
}