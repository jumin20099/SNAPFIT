package com.snapfit.api.controller;

import com.snapfit.api.entity.Like.TargetType;
import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomOAuth2User;
import com.snapfit.api.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;
    private final UserRepository userRepository;

    private User current(@AuthenticationPrincipal CustomOAuth2User principal) {
        if (principal == null) throw new IllegalArgumentException("인증 필요");
        return userRepository.findById(principal.getUser().getUserIdx())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggle(@RequestParam Long targetIdx,
                                    @RequestParam String targetType,
                                    @AuthenticationPrincipal CustomOAuth2User principal) {
        try {
            // POST 타입을 OUTFIT_SHARE로 매핑 (게시글용)
            TargetType type;
            if ("POST".equalsIgnoreCase(targetType)) {
                type = TargetType.OUTFIT_SHARE;
            } else {
                type = TargetType.valueOf(targetType.toUpperCase());
            }
            
            boolean liked = likeService.toggleLike(current(principal), targetIdx, type);
            long count = likeService.countLikes(targetIdx, type);
            return ResponseEntity.ok().body(java.util.Map.of("liked", liked, "count", count));
        } catch (Exception e) {
            // 오류 발생 시 기본값 반환
            return ResponseEntity.ok().body(java.util.Map.of("liked", false, "count", 0L));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam Long targetIdx, @RequestParam String targetType) {
        TargetType type = TargetType.valueOf(targetType.toUpperCase());
        return ResponseEntity.ok(likeService.countLikes(targetIdx, type));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> myLikes(@AuthenticationPrincipal CustomOAuth2User principal) {
        try {
            User user = current(principal);
            List<Like> userLikes = likeService.listUserLikes(user);
            
            // POST 타입(OUTFIT_SHARE)의 좋아요만 필터링하여 ID와 타입 정보 반환
            List<Map<String, Object>> likedPosts = userLikes.stream()
                .filter(like -> like.getTargetType() == TargetType.OUTFIT_SHARE)
                .map(like -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("targetIdx", like.getTargetIdx());
                    map.put("targetType", like.getTargetType().toString());
                    return map;
                })
                .toList();
            
            return ResponseEntity.ok(likedPosts);
        } catch (Exception e) {
            // 오류 발생 시 빈 리스트 반환
            return ResponseEntity.ok(List.of());
        }
    }
} 