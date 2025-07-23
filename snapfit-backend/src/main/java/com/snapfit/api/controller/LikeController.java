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
        TargetType type = TargetType.valueOf(targetType.toUpperCase());
        boolean liked = likeService.toggleLike(current(principal), targetIdx, type);
        long count = likeService.countLikes(targetIdx, type);
        return ResponseEntity.ok().body(java.util.Map.of("liked", liked, "count", count));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam Long targetIdx, @RequestParam String targetType) {
        TargetType type = TargetType.valueOf(targetType.toUpperCase());
        return ResponseEntity.ok(likeService.countLikes(targetIdx, type));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Like>> myLikes(@AuthenticationPrincipal CustomOAuth2User principal) {
        return ResponseEntity.ok(likeService.listUserLikes(current(principal)));
    }
} 