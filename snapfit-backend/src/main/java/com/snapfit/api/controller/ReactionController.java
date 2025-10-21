package com.snapfit.api.controller;

import com.snapfit.api.entity.Comment;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.CommentLikeRepository;
import com.snapfit.api.repository.CommentRepository;
import com.snapfit.api.repository.LikeRepository;
import com.snapfit.api.repository.ScrapRepository;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
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
            @AuthenticationPrincipal CustomUserDetails principal,
            @CookieValue(value = "snapfit_guest_id", required = false) String guestToken) {
        
        // 인증되지 않은 사용자의 경우 빈 응답 반환
        if (principal == null) {
            log.info("인증되지 않은 사용자입니다. 빈 반응 상태를 반환합니다.");
            return ResponseEntity.ok(Map.of());
        }
        
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
        
        User user = null;
        // 임시: JWT 토큰이 있어도 게스트로 처리 (디버깅용)
        // if (principal != null) {
        //     try {
        //         user = current(principal);
        //     } catch (Exception ex) {
        //         log.warn("사용자 정보 조회 실패: {}", ex.getMessage());
        //     }
        // }

        String guestIdx = null;
        if (user == null && StringUtils.hasText(guestToken)) {
            guestIdx = buildGuestIdentifier(guestToken);
            log.info("게스트 식별 완료: guestIdx={}, guestToken={}", guestIdx, guestToken);
        } else {
            log.info("게스트 식별 실패: user={}, guestToken={}", user != null ? "있음" : "없음", guestToken);
        }

        // 게시글 상태 조회
        for (Long postId : postIds) {
            boolean liked = false;
            if (user != null) {
                liked = likeRepository.existsByUserUserIdxAndTargetIdxAndTargetType(
                        user.getUserIdx(), postId, com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE);
            } else if (StringUtils.hasText(guestIdx)) {
                liked = likeRepository.existsByGuestIdxAndTargetIdxAndTargetType(
                        guestIdx, postId, com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE);
            }

            // 추천/비추천 상태 조회
            boolean recommended = false;
            boolean unrecommended = false;
            if (user != null) {
                recommended = likeRepository.existsByUserUserIdxAndTargetIdxAndTargetType(
                        user.getUserIdx(), postId, com.snapfit.api.entity.Like.TargetType.POST_RECOMMEND);
                unrecommended = likeRepository.existsByUserUserIdxAndTargetIdxAndTargetType(
                        user.getUserIdx(), postId, com.snapfit.api.entity.Like.TargetType.POST_UNRECOMMEND);
                log.info("로그인 사용자 상태 조회: postId={}, recommended={}, unrecommended={}", postId, recommended, unrecommended);
            } else if (StringUtils.hasText(guestIdx)) {
                recommended = likeRepository.existsByGuestIdxAndTargetIdxAndTargetType(
                        guestIdx, postId, com.snapfit.api.entity.Like.TargetType.POST_RECOMMEND);
                unrecommended = likeRepository.existsByGuestIdxAndTargetIdxAndTargetType(
                        guestIdx, postId, com.snapfit.api.entity.Like.TargetType.POST_UNRECOMMEND);
                log.info("게스트 사용자 상태 조회: postId={}, guestIdx={}, recommended={}, unrecommended={}", postId, guestIdx, recommended, unrecommended);
            } else {
                log.info("사용자 식별 실패: postId={}, user={}, guestIdx={}", postId, user != null ? "있음" : "없음", guestIdx);
            }

            boolean scraped = user != null && scrapRepository.existsByUserIdAndPostId(user.getUserIdx(), postId);
            long likeCount = likeRepository.countByTargetIdxAndTargetType(postId, com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE);
            long scrapCount = scrapRepository.countByPostId(postId);
            long recommendCount = likeRepository.countByTargetIdxAndTargetType(postId, com.snapfit.api.entity.Like.TargetType.POST_RECOMMEND);
            long unrecommendCount = likeRepository.countByTargetIdxAndTargetType(postId, com.snapfit.api.entity.Like.TargetType.POST_UNRECOMMEND);

            Map<String, Object> status = new HashMap<>();
            status.put("liked", liked);
            status.put("scraped", scraped);
            status.put("likeCount", likeCount);
            status.put("scrapCount", scrapCount);
            status.put("recommended", recommended);
            status.put("unrecommended", unrecommended);
            status.put("recommendCount", recommendCount);
            status.put("unrecommendCount", unrecommendCount);

            result.put("post_" + postId, status);
        }

        // 상품 상태 조회
        for (Long productId : productIds) {
            boolean liked = false;
            if (user != null) {
                liked = likeRepository.existsByUserUserIdxAndTargetIdxAndTargetType(
                        user.getUserIdx(), productId, com.snapfit.api.entity.Like.TargetType.PRODUCT);
            } else if (StringUtils.hasText(guestIdx)) {
                liked = likeRepository.existsByGuestIdxAndTargetIdxAndTargetType(
                        guestIdx, productId, com.snapfit.api.entity.Like.TargetType.PRODUCT);
            }

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
                if (user != null) {
                    liked = commentLikeRepository.findByCommentAndUser(comment, user).isPresent();
                }
                likeCount = commentLikeRepository.countByComment(comment);
            }

            Map<String, Object> status = new HashMap<>();
            status.put("liked", liked);
            status.put("likeCount", likeCount);

            result.put("comment_" + commentId, status);
        }

        log.info("통합 배치 상태 조회 완료: user={}, guest={}, totalItems={}",
                user != null ? user.getUserIdx() : "anonymous",
                StringUtils.hasText(guestIdx),
                result.size());

        return ResponseEntity.ok(result);
    }

    private String buildGuestIdentifier(String guestToken) {
        return guestToken;
    }
}
