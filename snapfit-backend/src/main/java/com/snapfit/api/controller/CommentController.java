package com.snapfit.api.controller;

import com.snapfit.api.entity.Comment;
import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.service.CommentService;
import com.snapfit.api.service.LikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;

/**
 * 댓글 API 컨트롤러
 * 게시글 댓글 CRUD 및 좋아요 관리
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comment", description = "댓글 관리 API")
public class CommentController {

    private final CommentService commentService;
    private final LikeService likeService;
    private final UserRepository userRepository;

    @Operation(summary = "댓글 작성", description = "게시글에 새 댓글을 작성합니다")
    @ApiResponse(responseCode = "201", description = "댓글 작성 성공")
    @ApiResponse(responseCode = "401", description = "인증 필요")
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> createComment(
            @Parameter(description = "게시글 ID") @PathVariable Long postId,
            @Valid @RequestBody Map<String, String> request,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest httpRequest) {
        
        // 임시로 인증 우회 - 현재 사용자를 김주민으로 설정
        String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7";
        log.info("댓글 작성 API 호출됨 - 임시 인증 우회");

        try {
            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "댓글 내용을 입력해주세요"));
            }

            log.info("댓글 작성 요청: 게시글={}, 사용자={}", postId, currentUserId);
            
            UUID userId = UUID.fromString(currentUserId);
            User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
            
            // 실제 DB에 댓글 저장
            Comment savedComment = commentService.createComment(postId, content.trim(), author, null);
            
            // 응답 데이터 생성
            Map<String, Object> commentResponse = Map.of(
                "commentId", savedComment.getCommentId(),
                "content", savedComment.getContent(),
                "author", Map.of(
                    "userId", author.getUserIdx().toString(),
                    "nickname", author.getNickname(),
                    "profileImage", author.getProfileImage() != null ? author.getProfileImage() : "/placeholder.svg"
                ),
                "createdAt", savedComment.getCreatedAt().toString(),
                "likeCount", 0, // 새 댓글이므로 0
                "liked", false  // 새 댓글이므로 false
            );
            
            log.info("댓글 작성 성공 (DB 저장): 게시글={}, 댓글ID={}", postId, savedComment.getCommentId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(commentResponse);
                
        } catch (IllegalArgumentException e) {
            log.warn("댓글 작성 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("댓글 작성 오류: 게시글={}, 사용자={}, 오류={}", postId, currentUserId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "댓글 작성 중 오류가 발생했습니다"));
        }
    }

    @Operation(summary = "댓글 목록 조회", description = "게시글의 댓글 목록을 조회합니다")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<?> getComments(
            @Parameter(description = "게시글 ID") @PathVariable Long postId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
        
        try {
            log.info("댓글 목록 조회: 게시글={}", postId);
            
            // 실제 DB에서 댓글 목록 조회
            Page<Comment> comments = commentService.getTopLevelComments(postId, pageable);
            
            log.info("댓글 목록 조회 성공: 게시글={}, 댓글 수={}", postId, comments.getTotalElements());
            return ResponseEntity.ok(comments);
                
        } catch (Exception e) {
            log.error("댓글 목록 조회 오류: 게시글={}, 오류={}", postId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "댓글 목록 조회 중 오류가 발생했습니다"));
        }
    }

    @Operation(summary = "댓글 수정", description = "본인이 작성한 댓글을 수정합니다")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @ApiResponse(responseCode = "401", description = "인증 필요")
    @ApiResponse(responseCode = "403", description = "권한 없음")
    @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @Parameter(description = "댓글 ID") @PathVariable Long commentId,
            @Valid @RequestBody Map<String, String> request,
            @AuthenticationPrincipal CustomUserDetails user) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "인증이 필요합니다"));
        }

        try {
            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "댓글 내용을 입력해주세요"));
            }

            log.info("댓글 수정 요청: 댓글={}, 사용자={}", commentId, user.getUserId());
            
            UUID userId = UUID.fromString(user.getUserId());
            User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
            
            Comment comment = commentService.updateComment(commentId, content.trim(), author);
            
            return ResponseEntity.ok(comment);
                
        } catch (IllegalArgumentException e) {
            log.warn("댓글 수정 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            log.warn("댓글 수정 권한 없음: 댓글={}, 사용자={}", commentId, user.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "본인이 작성한 댓글만 수정할 수 있습니다"));
        } catch (Exception e) {
            log.error("댓글 수정 오류: 댓글={}, 사용자={}, 오류={}", commentId, user.getUserId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "댓글 수정 중 오류가 발생했습니다"));
        }
    }

    @Operation(summary = "댓글 삭제", description = "본인이 작성한 댓글을 삭제합니다")
    @ApiResponse(responseCode = "204", description = "삭제 성공")
    @ApiResponse(responseCode = "401", description = "인증 필요")
    @ApiResponse(responseCode = "403", description = "권한 없음")
    @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @Parameter(description = "댓글 ID") @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails user) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "인증이 필요합니다"));
        }

        try {
            log.info("댓글 삭제 요청: 댓글={}, 사용자={}", commentId, user.getUserId());
            
            UUID userId = UUID.fromString(user.getUserId());
            User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
            
            commentService.deleteComment(commentId, author);
            
            return ResponseEntity.noContent().build();
                
        } catch (IllegalArgumentException e) {
            log.warn("댓글 삭제 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            log.warn("댓글 삭제 권한 없음: 댓글={}, 사용자={}", commentId, user.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "본인이 작성한 댓글만 삭제할 수 있습니다"));
        } catch (Exception e) {
            log.error("댓글 삭제 오류: 댓글={}, 사용자={}, 오류={}", commentId, user.getUserId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "댓글 삭제 중 오류가 발생했습니다"));
        }
    }

    @Operation(summary = "댓글 좋아요 토글", description = "댓글의 좋아요를 토글합니다")
    @ApiResponse(responseCode = "200", description = "토글 성공")
    @ApiResponse(responseCode = "401", description = "인증 필요")
    @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<?> toggleCommentLike(
            @Parameter(description = "댓글 ID") @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest httpRequest) {
        
        // 임시로 인증 우회 - 현재 사용자를 김주민으로 설정
        String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7";
        log.info("댓글 좋아요 API 호출됨 - 임시 인증 우회");

        try {
            log.info("댓글 좋아요 토글: 댓글={}, 사용자={}", commentId, currentUserId);
            
            UUID userId = UUID.fromString(currentUserId);
            User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
            
            // 댓글 존재 확인
            Comment comment = commentService.getComment(commentId);
            if (comment == null) {
                throw new IllegalArgumentException("댓글을 찾을 수 없습니다");
            }
            
            // 좋아요 토글 (실제 LikeService 메서드 사용)
            boolean newLikedState = likeService.toggleLike(currentUser, commentId, Like.TargetType.COMMENT);
            
            // 댓글의 총 좋아요 수 조회
            long likeCount = likeService.countLikes(commentId, Like.TargetType.COMMENT);
            
            Map<String, Object> result = Map.of(
                "liked", newLikedState, 
                "likeCount", likeCount
            );
            
            log.info("댓글 좋아요 토글 성공 (DB 저장): 댓글={}, 좋아요 여부={}, 좋아요 수={}", 
                    commentId, newLikedState, likeCount);
            
            return ResponseEntity.ok(result);
                
        } catch (IllegalArgumentException e) {
            log.warn("댓글 좋아요 토글 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("댓글 좋아요 토글 오류: 댓글={}, 사용자={}, 오류={}", commentId, currentUserId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "댓글 좋아요 처리 중 오류가 발생했습니다"));
        }
    }
}
