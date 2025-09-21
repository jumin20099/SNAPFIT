package com.snapfit.api.controller;

import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.Scrap;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.LikeRepository;
import com.snapfit.api.repository.ScrapRepository;
import com.snapfit.api.repository.UserRepository;
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

    private User current(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) throw new IllegalArgumentException("인증 필요");
        return userRepository.findById(principal.getUser().getUserIdx())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }

    @PostMapping("/status")
    public ResponseEntity<Map<Long, Map<String, Object>>> getReactionStatus(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        
        @SuppressWarnings("unchecked")
        List<Integer> postIdsRaw = (List<Integer>) request.get("postIds");
        List<Long> postIds = postIdsRaw.stream().map(Integer::longValue).collect(java.util.stream.Collectors.toList());
        
        if (postIds == null || postIds.isEmpty()) {
            log.warn("postIds가 비어있음");
            return ResponseEntity.ok(new HashMap<>());
        }

        Map<Long, Map<String, Object>> result = new HashMap<>();
        
        try {
            User user = current(principal);
            log.info("인증된 사용자로 배치 상태 조회: 사용자={}, 게시글 수={}", user.getUserIdx(), postIds.size());
            
            for (Long postId : postIds) {
                // 좋아요 상태 확인 (OUTFIT_SHARE 타입으로 가정)
                boolean liked = likeRepository.existsByUserUserIdxAndTargetIdxAndTargetType(
                    user.getUserIdx(), 
                    postId, 
                    com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE
                );
                
                // 스크랩 상태 확인
                boolean scraped = scrapRepository.existsByUserIdAndPostId(user.getUserIdx(), postId);
                
                // 좋아요 개수 조회
                long likeCount = likeRepository.countByTargetIdxAndTargetType(
                    postId, 
                    com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE
                );
                
                // 스크랩 개수 조회
                long scrapCount = scrapRepository.countByPostId(postId);
                
                Map<String, Object> status = new HashMap<>();
                status.put("liked", liked);
                status.put("scraped", scraped);
                status.put("likeCount", likeCount);
                status.put("scrapCount", scrapCount);
                
                result.put(postId, status);
            }
            
            log.info("배치 상태 조회 완료: 사용자={}, 게시글 수={}", user.getUserIdx(), postIds.size());
            
        } catch (Exception e) {
            log.warn("인증 실패, 기본 상태로 반환: {}", e.getMessage());
            
            // 인증 실패 시 기본 상태 반환
            for (Long postId : postIds) {
                Map<String, Object> status = new HashMap<>();
                status.put("liked", false);
                status.put("scraped", false);
                status.put("likeCount", likeRepository.countByTargetIdxAndTargetType(
                    postId, 
                    com.snapfit.api.entity.Like.TargetType.OUTFIT_SHARE
                ));
                status.put("scrapCount", scrapRepository.countByPostId(postId));
                
                result.put(postId, status);
            }
        }
        
        return ResponseEntity.ok(result);
    }
}
