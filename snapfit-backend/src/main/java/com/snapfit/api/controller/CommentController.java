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
import com.snapfit.api.service.AnonymousUserService;
import com.snapfit.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final AnonymousUserService anonymousUserService;
    private final JwtUtil jwtUtil;
    
    // 댓글 작성
    @PostMapping("/posts/{postId}")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        
        try {
            // 게시글 조회
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + postId));
            
            User author = null;
            String authorName = "익명";
            String authorProfileImage = "/placeholder.svg";
            Integer anonymousIndex = null;
            
            // 1. JWT 토큰으로 인증된 사용자 조회
            log.info("댓글 작성 요청 - authHeader: {}", authHeader != null ? "있음" : "없음");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    log.info("JWT 토큰 추출 성공: {}", token.substring(0, Math.min(20, token.length())) + "...");
                    // JWT 토큰에서 이메일 추출 (PostController와 동일한 방식)
                    String email = jwtUtil.getSubjectFromToken(token);
                    log.info("JWT에서 추출된 이메일: {}", email);
                    if (email != null) {
                        author = userRepository.findByEmail(email).orElse(null);
                        if (author != null) {
                            authorName = author.getNickname();
                            authorProfileImage = author.getProfileImage() != null ? author.getProfileImage() : "/placeholder.svg";
                            log.info("인증된 사용자 댓글 작성: email={}, nickname={}", email, authorName);
                        } else {
                            log.warn("이메일로 사용자를 찾을 수 없음: {}", email);
                        }
                    } else {
                        log.warn("JWT 토큰에서 이메일 추출 실패");
                    }
                } catch (Exception e) {
                    log.warn("JWT 토큰 파싱 실패: {}", e.getMessage());
                }
            } else {
                log.info("JWT 토큰이 없거나 Bearer 형식이 아님: {}", authHeader);
            }
            
            // 2. JWT 토큰이 없거나 유효하지 않은 경우 SecurityContext 확인
            if (author == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated() && 
                    !"anonymousUser".equals(authentication.getName())) {
                    String email = authentication.getName();
                    author = userRepository.findByEmail(email).orElse(null);
                    if (author != null) {
                        authorName = author.getNickname();
                        authorProfileImage = author.getProfileImage() != null ? author.getProfileImage() : "/placeholder.svg";
                        log.info("SecurityContext 사용자 댓글 작성: email={}, nickname={}", email, authorName);
                    }
                }
            }
            
            // 익명 사용자인 경우 익명 인덱스 할당
            if (author == null) {
                String userIdentifier = getClientIp(clientIp, realIp);
                anonymousIndex = anonymousUserService.getOrAssignAnonymousIndex(postId, userIdentifier);
                authorName = anonymousUserService.generateAnonymousName(anonymousIndex);
                log.info("익명 사용자 댓글 작성: postId={}, userIdentifier={}, anonymousIndex={}", postId, userIdentifier, anonymousIndex);
            }
            
            // 댓글 생성
            Comment comment = Comment.builder()
                    .post(post)
                    .author(author)
                    .content(request.getContent())
                    .likeCount(0L)
                    .anonymousIndex(anonymousIndex)
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
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "time") String sortBy) {
        
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + postId));
            
            // 인증된 사용자 조회 (없으면 null로 처리)
            final User currentUser;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getName())) {
                String email = authentication.getName();
                currentUser = userRepository.findByEmail(email).orElse(null);
            } else {
                currentUser = null;
            }
            
            // 댓글 조회 (대댓글 제외) - 정렬 방식에 따라 다르게 처리
            Pageable pageable = PageRequest.of(page, size);
            Page<Comment> comments;
            
            if ("popular".equals(sortBy)) {
                // 인기순 정렬 (좋아요 수 + 대댓글 수)
                comments = commentRepository.findByPostAndParentIsNullOrderByLikeCountDesc(post, pageable);
            } else {
                // 시간순 정렬 (기본값)
                comments = commentRepository.findByPostAndParentIsNullOrderByCreatedAtDesc(post, pageable);
            }
            
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
    @Transactional
    public ResponseEntity<CommentResponseDto> toggleLike(@PathVariable Long commentId) {
        
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다: " + commentId));
            
            // 인증된 사용자 조회
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(401).body(null);
            }
            
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + email));
            
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
        
        // 익명 사용자인 경우 익명 이름 사용
        if (comment.getAnonymousIndex() != null) {
            dto.setAuthorName(anonymousUserService.generateAnonymousName(comment.getAnonymousIndex()));
            dto.setAuthorProfileImage("/placeholder.svg");
        } else if (comment.getAuthor() != null) {
            dto.setAuthorName(comment.getAuthor().getNickname());
            dto.setAuthorProfileImage(comment.getAuthor().getProfileImage() != null ? comment.getAuthor().getProfileImage() : "/placeholder.svg");
        } else {
            // author가 null인 경우 (데이터 무결성 문제)
            dto.setAuthorName("알 수 없음");
            dto.setAuthorProfileImage("/placeholder.svg");
            log.warn("댓글 {}의 author가 null입니다. anonymousIndex: {}", comment.getCommentId(), comment.getAnonymousIndex());
        }
        
        dto.setParentId(comment.getParent() != null ? comment.getParent().getCommentId() : null);
        dto.setLikeCount(comment.getLikeCount());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        
        // 현재 사용자의 좋아요 상태 확인 (사용자가 없으면 false)
        boolean isLiked = false;
        if (currentUser != null) {
            isLiked = commentLikeRepository.findByCommentAndUser(comment, currentUser).isPresent();
        }
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
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIp(String forwardedFor, String realIp) {
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            return forwardedFor.split(",")[0].trim();
        }
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }
        return "unknown";
    }
    
}