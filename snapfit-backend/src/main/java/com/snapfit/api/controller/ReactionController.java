package com.snapfit.api.controller;

import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.Scrap;
import com.snapfit.api.entity.User;
import com.snapfit.api.entity.Comment;
import com.snapfit.api.repository.LikeRepository;
import com.snapfit.api.repository.ScrapRepository;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.repository.CommentRepository;
import com.snapfit.api.repository.CommentLikeRepository;
import com.snapfit.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reactions")
@RequiredArgsConstructor
@Slf4j
public class ReactionController {

    private final LikeRepository likeRepository;
    private final ScrapRepository scrapRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;

    private User current(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) throw new IllegalArgumentException("인증 필요");
        return userRepository.findById(principal.getUser().getUserIdx())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }

    @PostMapping("/status")
    public ResponseEntity<Map<String, Map<String, Object>>> getReactionStatus(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        
        @SuppressWarnings("unchecked")
        List<Integer> postIdsRaw = (List<Integer>) request.get("postIds");
        @SuppressWarnings("unchecked")
        List<Integer> productIdsRaw = (List<Integer>) request.get("productIds");
        @SuppressWarnings("unchecked")
        List<Integer> commentIdsRaw = (List<Integer>) request.get("commentIds");
        
        List<Long> postIds = postIdsRaw != null ? postIdsRaw.stream().map(Integer::longValue).collect(java.util.stream.Collectors.toList()) : List.of();
        List<Long> productIds = productIdsRaw != null ? productIdsRaw.stream().map(Integer::longValue).collect(java.util.stream.Collectors.toList()) : List.of();
        List<Long> commentIds = commentIdsRaw != null ? commentIdsRaw.stream().map(Integer::longValue).collect(java.util.stream.Collectors.toList()) : List.of();
        
        if (postIds.isEmpty() && productIds.isEmpty() && commentIds.isEmpty()) {
            log.warn("모든 ID가 비어있음");
            return ResponseEntity.ok(new HashMap<>());
        }

        Map<String, Map<String, Object>> result = new HashMap<>();
        
        try {
            User user = current(principal);
            log.info("인증된 사용자로 통합 배치 상태 조회: 사용자={}, 게시글={}, 상품={}, 댓글={}", 
                user.getUserIdx(), postIds.size(), productIds.size(), commentIds.size());
            
            // 게시글 상태 조회
            for (Long postId : postIds) {
                boolean liked = likeRepository.existsByUserUserIdxAndTargetIdxAndTargetType(
                    user.getUserIdx(), postId, com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE);
                boolean scraped = scrapRepository.existsByUserIdAndPostId(user.getUserIdx(), postId);
                long likeCount = likeRepository.countByTargetIdxAndTargetType(postId, com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE);
                long scrapCount = scrapRepository.countByPostId(postId);
                
                Map<String, Object> status = new HashMap<>();
                status.put("liked", liked);
                status.put("scraped", scraped);
                status.put("likeCount", likeCount);
                status.put("scrapCount", scrapCount);
                
                result.put("post_" + postId, status);
            }
            
            // 상품 상태 조회
            for (Long productId : productIds) {
                boolean liked = likeRepository.existsByUserUserIdxAndTargetIdxAndTargetType(
                    user.getUserIdx(), productId, com.snapfit.api.entity.Like.TargetType.PRODUCT);
                long likeCount = likeRepository.countByTargetIdxAndTargetType(productId, com.snapfit.api.entity.Like.TargetType.PRODUCT);
                
                Map<String, Object> status = new HashMap<>();
                status.put("liked", liked);
                status.put("likeCount", likeCount);
                
                result.put("product_" + productId, status);
            }
            
            // 댓글 상태 조회 (CommentLike 테이블 사용)
            for (Long commentId : commentIds) {
                Comment comment = commentRepository.findById(commentId).orElse(null);
                boolean liked = false;
                long likeCount = 0;
                
                if (comment != null) {
                    // CommentLike 테이블에서 좋아요 상태 확인
                    liked = commentLikeRepository.findByCommentAndUser(comment, user).isPresent();
                    // 댓글의 좋아요 수 조회
                    likeCount = commentLikeRepository.countByComment(comment);
                }
                
                Map<String, Object> status = new HashMap<>();
                status.put("liked", liked);
                status.put("likeCount", likeCount);
                
                result.put("comment_" + commentId, status);
            }
            
            log.info("통합 배치 상태 조회 완료: 사용자={}, 총 항목={}", user.getUserIdx(), result.size());
            
        } catch (Exception e) {
            log.warn("인증 실패, 기본 상태로 반환: {}", e.getMessage());
            
            // 인증 실패 시 기본 상태 반환
            for (Long postId : postIds) {
                Map<String, Object> status = new HashMap<>();
                status.put("liked", false);
                status.put("scraped", false);
                status.put("likeCount", likeRepository.countByTargetIdxAndTargetType(postId, com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE));
                status.put("scrapCount", scrapRepository.countByPostId(postId));
                result.put("post_" + postId, status);
            }
            
            for (Long productId : productIds) {
                Map<String, Object> status = new HashMap<>();
                status.put("liked", false);
                status.put("likeCount", likeRepository.countByTargetIdxAndTargetType(productId, com.snapfit.api.entity.Like.TargetType.PRODUCT));
                result.put("product_" + productId, status);
            }
            
            for (Long commentId : commentIds) {
                Map<String, Object> status = new HashMap<>();
                status.put("liked", false);
                status.put("likeCount", likeRepository.countByTargetIdxAndTargetType(commentId, com.snapfit.api.entity.Like.TargetType.COMMENT));
                result.put("comment_" + commentId, status);
            }
        }
        
        return ResponseEntity.ok(result);
    }
}
