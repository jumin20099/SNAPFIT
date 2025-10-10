package com.snapfit.api.controller;

import com.snapfit.api.dto.comment.CommentRequestDto;
import com.snapfit.api.dto.comment.CommentResponseDto;
import com.snapfit.api.dto.comment.CommentLikeResponseDto;
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
import com.snapfit.api.security.InputSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
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
    private final PasswordEncoder passwordEncoder;
    private final InputSanitizer inputSanitizer;
    
    // 댓글 작성
    @PostMapping("/posts/{postId}")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        
        try {
            // 요청 데이터 로깅
            log.info("댓글 작성 요청 데이터: postId={}, content={}, parentId={}, anonymousPassword={}", 
                    postId, request.getContent(), request.getParentId(), request.getAnonymousPassword());
            
            // 게시글 조회
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + postId));
            
            User author = null;
            String authorName = "익명";
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
                        log.info("SecurityContext 사용자 댓글 작성: email={}, nickname={}", email, authorName);
                    }
                }
            }
            
            // 익명 사용자인 경우 익명 인덱스 할당 및 비밀번호 검증
            String anonymousPasswordHash = null;
            if (author == null) {
                String userIdentifier = getClientIp(clientIp, realIp);
                anonymousIndex = anonymousUserService.getOrAssignAnonymousIndex(postId, userIdentifier);
                authorName = anonymousUserService.generateAnonymousName(anonymousIndex);
                
                // 익명 댓글 비밀번호 검증
                String anonymousPassword = request.getAnonymousPassword();
                if (!StringUtils.hasText(anonymousPassword) || anonymousPassword.trim().length() < 4) {
                    log.warn("익명 댓글 비밀번호 검증 실패: postId={}, passwordLength={}", postId, 
                            anonymousPassword != null ? anonymousPassword.length() : 0);
                    throw new RuntimeException("익명 댓글은 4자 이상의 비밀번호가 필요합니다.");
                }
                anonymousPasswordHash = passwordEncoder.encode(anonymousPassword.trim());
                
                log.info("익명 사용자 댓글 작성: postId={}, userIdentifier={}, anonymousIndex={}", postId, userIdentifier, anonymousIndex);
            }
            
            // 댓글 내용 sanitizing
            String sanitizedContent = inputSanitizer.sanitizeComment(request.getContent());
            if (!inputSanitizer.isSafeInput(sanitizedContent)) {
                log.warn("댓글 내용에 위험한 입력 감지: postId={}, content={}", postId, request.getContent());
                throw new RuntimeException("댓글 내용에 허용되지 않는 문자가 포함되어 있습니다");
            }
            
            // 댓글 생성
            Comment comment = Comment.builder()
                    .post(post)
                    .author(author)
                    .content(sanitizedContent)
                    .likeCount(0L)
                    .anonymousIndex(anonymousIndex)
                    .anonymousPasswordHash(anonymousPasswordHash)
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
            
            CommentResponseDto response = convertToDto(savedComment, author, null);
            log.info("댓글 생성 성공: commentId={}, postId={}", savedComment.getCommentId(), postId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("댓글 생성 실패", e);
            throw new RuntimeException("댓글 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 게시글의 댓글 목록 조회
    @GetMapping("/posts/{postId}")
    @Transactional
    public ResponseEntity<List<CommentResponseDto>> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "time") String sortBy,
            @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다: " + postId));
            
            // 인증된 사용자 조회 (없으면 null로 처리)
            final User currentUser;
            final Integer anonymousIndex;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getName())) {
                String email = authentication.getName();
                currentUser = userRepository.findByEmail(email).orElse(null);
                anonymousIndex = null;
            } else {
                currentUser = null;
                // 익명 사용자의 경우 익명 인덱스 할당
                String userIdentifier = getClientIp(clientIp, realIp);
                anonymousIndex = anonymousUserService.getOrAssignAnonymousIndex(postId, userIdentifier);
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
                    .map(comment -> convertToDtoWithReplies(comment, currentUser, anonymousIndex))
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
    public ResponseEntity<CommentLikeResponseDto> toggleLike(
            @PathVariable Long commentId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다: " + commentId));
            
            User currentUser = null;
            Integer anonymousIndex = null;
            String anonymousPasswordHash = null;
            
            // 1. JWT 토큰으로 인증된 사용자 조회
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    String email = jwtUtil.getSubjectFromToken(token);
                    if (email != null) {
                        currentUser = userRepository.findByEmail(email).orElse(null);
                        if (currentUser != null) {
                            log.info("인증된 사용자 댓글 좋아요: commentId={}, email={}", commentId, email);
                        }
                    }
                } catch (Exception e) {
                    log.warn("JWT 토큰 파싱 실패: {}", e.getMessage());
                }
            }
            
            // 2. JWT 토큰이 없거나 유효하지 않은 경우 SecurityContext 확인
            if (currentUser == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated() && 
                    !"anonymousUser".equals(authentication.getName())) {
                    String email = authentication.getName();
                    currentUser = userRepository.findByEmail(email).orElse(null);
                    if (currentUser != null) {
                        log.info("SecurityContext 사용자 댓글 좋아요: commentId={}, email={}", commentId, email);
                    }
                }
            }
            
            // 3. 익명 사용자인 경우 익명 인덱스 할당
            if (currentUser == null) {
                String userIdentifier = getClientIp(clientIp, realIp);
                anonymousIndex = anonymousUserService.getOrAssignAnonymousIndex(comment.getPost().getPostId(), userIdentifier);
                anonymousPasswordHash = "anonymous_like"; // 익명 좋아요는 비밀번호 검증 없음
                log.info("익명 사용자 댓글 좋아요: commentId={}, userIdentifier={}, anonymousIndex={}", 
                        commentId, userIdentifier, anonymousIndex);
            }
            
            // 좋아요 상태 확인
            boolean isLiked = false;
            if (currentUser != null) {
                isLiked = commentLikeRepository.findByCommentAndUser(comment, currentUser).isPresent();
            } else {
                isLiked = commentLikeRepository.findByCommentAndAnonymousIndex(comment, anonymousIndex).isPresent();
            }
            
            if (isLiked) {
                // 좋아요 취소
                if (currentUser != null) {
                    commentLikeRepository.deleteByCommentAndUser(comment, currentUser);
                } else {
                    commentLikeRepository.deleteByCommentAndAnonymousIndex(comment, anonymousIndex);
                }
                comment.setLikeCount(comment.getLikeCount() - 1);
            } else {
                // 좋아요 추가
                CommentLike commentLike = CommentLike.builder()
                        .comment(comment)
                        .user(currentUser)
                        .anonymousIndex(anonymousIndex)
                        .anonymousPasswordHash(anonymousPasswordHash)
                        .build();
                commentLikeRepository.save(commentLike);
                comment.setLikeCount(comment.getLikeCount() + 1);
            }
            
            commentRepository.save(comment);
            
            // 댓글 좋아요 응답 DTO 생성
            CommentLikeResponseDto response = new CommentLikeResponseDto();
            response.setCommentId(comment.getCommentId());
            response.setIsLiked(!isLiked); // 토글 후 상태
            response.setLikeCount(comment.getLikeCount());
            
            log.info("댓글 좋아요 토글 성공: commentId={}, liked={}", commentId, !isLiked);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("댓글 좋아요 토글 실패", e);
            throw new RuntimeException("댓글 좋아요 토글 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam(value = "password", required = false) String password) {
        
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다: " + commentId));
            
            // 인증된 사용자 조회
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (comment.getAuthor() != null) {
                // 로그인된 사용자의 댓글인 경우
                if (authentication == null || !authentication.isAuthenticated() || 
                    "anonymousUser".equals(authentication.getName())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
                
                String email = authentication.getName();
                User currentUser = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + email));
                
                // 댓글 작성자 확인
                if (!comment.getAuthor().getUserIdx().equals(currentUser.getUserIdx())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            } else {
                // 익명 댓글인 경우 비밀번호 검증
                if (!StringUtils.hasText(password)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                }
                
                if (comment.getAnonymousPasswordHash() == null ||
                    !passwordEncoder.matches(password, comment.getAnonymousPasswordHash())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }
            
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
    private CommentResponseDto convertToDto(Comment comment, User currentUser, Integer anonymousIndex) {
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
        
        // 현재 사용자의 좋아요 상태 확인
        boolean isLiked = false;
        if (currentUser != null) {
            isLiked = commentLikeRepository.findByCommentAndUser(comment, currentUser).isPresent();
        } else if (anonymousIndex != null) {
            // 익명 사용자의 경우 익명 인덱스로 확인
            isLiked = commentLikeRepository.findByCommentAndAnonymousIndex(comment, anonymousIndex).isPresent();
        }
        dto.setIsLiked(isLiked);
        
        return dto;
    }
    
    // DTO 변환 (대댓글 포함)
    private CommentResponseDto convertToDtoWithReplies(Comment comment, User currentUser, Integer anonymousIndex) {
        CommentResponseDto dto = convertToDto(comment, currentUser, anonymousIndex);
        
        // 대댓글 변환
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentResponseDto> replies = comment.getReplies().stream()
                    .map(reply -> convertToDto(reply, currentUser, anonymousIndex))
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