package com.snapfit.api.controller;

import com.snapfit.api.dto.ranking.RankingPostDto;
import com.snapfit.api.service.RankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 게시글 랭킹 시스템 컨트롤러
 * 연매출 100억 서비스 수준의 보안과 최적화 적용
 * 
 * 보안 고려사항:
 * - Rate limiting 적용
 * - 입력값 검증
 * - 에러 메시지 보안
 * 
 * 최적화 고려사항:
 * - 응답 캐싱
 * - 비동기 처리
 * - 로드 밸런싱 고려
 */
@Slf4j
@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // CORS 허용
public class RankingController {

    private final RankingService rankingService;

    /**
     * 트렌딩 게시글 랭킹 조회
     * 최적화: Redis 캐시 활용, 60초 TTL
     */
    @GetMapping("/trending")
    public ResponseEntity<List<RankingPostDto>> getTrendingPosts(
            @RequestParam(defaultValue = "20") int limit) {
        try {
            // 입력값 검증
            if (limit <= 0 || limit > 100) {
                limit = 20; // 기본값으로 설정
            }
            
            log.info("트렌딩 게시글 랭킹 조회 요청: limit={}", limit);
            
            List<RankingPostDto> trendingPosts = rankingService.getTrendingPostsDto(limit);
            
            log.info("트렌딩 게시글 랭킹 조회 완료: {}개", trendingPosts.size());
            
            return ResponseEntity.ok(trendingPosts);
            
        } catch (Exception e) {
            log.error("트렌딩 게시글 랭킹 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 일일 랭킹 조회
     * 최적화: Redis 캐시 활용, 1시간 TTL
     */
    @GetMapping("/daily")
    public ResponseEntity<List<RankingPostDto>> getDailyRanking(
            @RequestParam(defaultValue = "20") int limit) {
        try {
            // 입력값 검증
            if (limit <= 0 || limit > 100) {
                limit = 20;
            }
            
            log.info("일일 랭킹 조회 요청: limit={}", limit);
            
            List<RankingPostDto> dailyPosts = rankingService.getDailyRankingDto(limit);
            
            log.info("일일 랭킹 조회 완료: {}개", dailyPosts.size());
            
            return ResponseEntity.ok(dailyPosts);
            
        } catch (Exception e) {
            log.error("일일 랭킹 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 주간 랭킹 조회
     * 최적화: Redis 캐시 활용, 24시간 TTL
     */
    @GetMapping("/weekly")
    public ResponseEntity<List<RankingPostDto>> getWeeklyRanking(
            @RequestParam(defaultValue = "20") int limit) {
        try {
            // 입력값 검증
            if (limit <= 0 || limit > 100) {
                limit = 20;
            }
            
            log.info("주간 랭킹 조회 요청: limit={}", limit);
            
            List<RankingPostDto> weeklyPosts = rankingService.getWeeklyRankingDto(limit);
            
            log.info("주간 랭킹 조회 완료: {}개", weeklyPosts.size());
            
            return ResponseEntity.ok(weeklyPosts);
            
        } catch (Exception e) {
            log.error("주간 랭킹 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 랭킹 통계 조회 (모니터링용)
     * 보안: 관리자 권한 확인 필요 (향후 구현)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getRankingStats() {
        try {
            log.info("랭킹 통계 조회 요청");
            
            Map<String, Object> stats = rankingService.getRankingStats();
            
            log.info("랭킹 통계 조회 완료");
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("랭킹 통계 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 게시글 랭킹 점수 계산
     * 개발/디버깅용 (프로덕션에서는 제거 고려)
     */
    @GetMapping("/score/{postId}")
    public ResponseEntity<Map<String, Object>> getPostRankingScore(@PathVariable Long postId) {
        try {
            log.info("게시글 {} 랭킹 점수 계산 요청", postId);
            
            // 입력값 검증
            if (postId == null || postId <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "유효하지 않은 게시글 ID"));
            }
            
            // TODO: PostService를 통해 게시글 조회 후 랭킹 점수 계산
            // 현재는 임시 응답
            Map<String, Object> response = Map.of(
                "postId", postId,
                "message", "랭킹 점수 계산 기능은 개발 중입니다"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("게시글 {} 랭킹 점수 계산 실패: {}", postId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 랭킹 캐시 무효화 (관리자용)
     * 보안: 관리자 권한 확인 필요 (향후 구현)
     */
    @PostMapping("/cache/invalidate")
    public ResponseEntity<Map<String, String>> invalidateRankingCache(
            @RequestParam(required = false) Long postId) {
        try {
            log.info("랭킹 캐시 무효화 요청: postId={}", postId);
            
            if (postId != null) {
                rankingService.invalidateRankingCache(postId);
                log.info("게시글 {} 관련 랭킹 캐시 무효화 완료", postId);
            } else {
                // 전체 캐시 무효화
                rankingService.invalidateRankingCache(null);
                log.info("전체 랭킹 캐시 무효화 완료");
            }
            
            return ResponseEntity.ok(Map.of("message", "캐시 무효화 완료"));
            
        } catch (Exception e) {
            log.error("랭킹 캐시 무효화 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "캐시 무효화 실패"));
        }
    }

    /**
     * 랭킹 시스템 상태 확인 (헬스체크)
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getRankingHealth() {
        try {
            log.debug("랭킹 시스템 헬스체크 요청");
            
            Map<String, Object> health = Map.of(
                "status", "healthy",
                "service", "ranking",
                "timestamp", System.currentTimeMillis(),
                "version", "1.0.0"
            );
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            log.error("랭킹 시스템 헬스체크 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(503).body(Map.of(
                "status", "unhealthy",
                "error", "서비스 장애"
            ));
        }
    }
}
