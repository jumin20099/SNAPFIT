package com.snapfit.api.controller;

import com.snapfit.api.entity.Scrap;
import com.snapfit.api.entity.User;
import com.snapfit.api.dto.scrap.ScrapResponseDto;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.service.ScrapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/scraps")
@RequiredArgsConstructor
public class ScrapController {

    private final ScrapService scrapService;
    private final UserRepository userRepository;

    private User current(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) throw new IllegalArgumentException("인증 필요");
        return userRepository.findById(principal.getUser().getUserIdx())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggle(@RequestBody Map<String, Object> request,
                                    @AuthenticationPrincipal CustomUserDetails principal) {
        User user = current(principal);
        Long postId = Long.valueOf(request.get("postId").toString());
        boolean scraped = scrapService.toggleScrap(user.getUserIdx(), postId);
        
        // 스크랩 개수를 직접 계산
        long count = scrapService.getPostScrapCount(postId);
        
        return ResponseEntity.ok().body(Map.of("scraped", scraped, "count", count));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam Long postId) {
        Map<String, Object> stats = scrapService.getPostScrapStatistics(postId);
        return ResponseEntity.ok((Long) stats.get("totalScraps"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Long>> myScraps(@AuthenticationPrincipal CustomUserDetails principal) {
        try {
            User user = current(principal);
            List<Long> scrapedPostIds = scrapService.getUserScrapedPostIds(user.getUserIdx());
            return ResponseEntity.ok(scrapedPostIds);
        } catch (Exception e) {
            // 오류 발생 시 빈 리스트 반환
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/my/detailed")
    public ResponseEntity<List<ScrapResponseDto>> myScrapsDetailed(@AuthenticationPrincipal CustomUserDetails principal) {
        try {
            User user = current(principal);
            List<ScrapResponseDto> scrapedPosts = scrapService.getUserScrapedPostsDetailed(user.getUserIdx());
            return ResponseEntity.ok(scrapedPosts);
        } catch (Exception e) {
            // 오류 발생 시 빈 리스트 반환
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkScrap(@RequestParam Long postId,
                                             @AuthenticationPrincipal CustomUserDetails principal) {
        User user = current(principal);
        boolean scraped = scrapService.isScraped(user.getUserIdx(), postId);
        return ResponseEntity.ok(scraped);
    }
}
