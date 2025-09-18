package com.snapfit.community.controller;

import com.snapfit.community.service.PostViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostViewController {
    
    private final PostViewService postViewService;
    
    /**
     * 게시글 조회수 증가 (매번 증가)
     * Redis를 사용하여 원자적 연산 수행
     */
    @PostMapping("/{postId}/view")
    public ResponseEntity<?> incrementViewCount(@PathVariable Long postId) {
        try {
            // Redis를 사용하여 조회수 증가
            boolean incremented = postViewService.incrementViewCount(postId);
            
            // 현재 조회수 가져오기
            long currentViewCount = postViewService.getViewCount(postId);
            
            if (incremented) {
                return ResponseEntity.ok().body(Map.of(
                    "success", true, 
                    "message", "조회수 증가",
                    "postId", postId,
                    "viewCount", currentViewCount
                ));
            } else {
                return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "조회수 증가 실패"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "조회수 증가 실패: " + e.getMessage()));
        }
    }
    
    /**
     * 게시글 조회수 조회
     */
    @GetMapping("/{postId}/view-count")
    public ResponseEntity<?> getViewCount(@PathVariable Long postId) {
        try {
            long viewCount = postViewService.getViewCount(postId);
            return ResponseEntity.ok().body(Map.of("viewCount", viewCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "조회수 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * Redis 연결 테스트
     */
    @GetMapping("/test/redis")
    public ResponseEntity<?> testRedis() {
        try {
            // Redis에 테스트 값 저장
            postViewService.testRedisConnection();
            return ResponseEntity.ok(Map.of("success", true, "message", "Redis 연결 성공"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "Redis 연결 실패: " + e.getMessage()));
        }
    }
    
    /**
     * 조회수 증가 디버깅
     */
    @PostMapping("/{postId}/view-debug")
    public ResponseEntity<?> incrementViewCountDebug(@PathVariable Long postId) {
        try {
            System.out.println("=== 조회수 증가 디버깅 시작 ===");
            System.out.println("postId: " + postId);
            
            // Redis를 사용하여 조회수 증가
            boolean incremented = postViewService.incrementViewCount(postId);
            System.out.println("incremented: " + incremented);
            
            // 현재 조회수 가져오기
            long currentViewCount = postViewService.getViewCount(postId);
            System.out.println("currentViewCount: " + currentViewCount);
            
            return ResponseEntity.ok().body(Map.of(
                "success", true, 
                "message", "조회수 증가 디버깅",
                "postId", postId,
                "incremented", incremented,
                "viewCount", currentViewCount
            ));
        } catch (Exception e) {
            System.out.println("조회수 증가 디버깅 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "조회수 증가 실패: " + e.getMessage()));
        }
    }
}
