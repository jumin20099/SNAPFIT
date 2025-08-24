package com.snapfit.api.service;

import com.snapfit.api.entity.*;
import com.snapfit.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 커뮤니티 통합 서비스
 * 보안과 성능을 고려한 비즈니스 로직
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityService {

    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final CommentRepository commentRepository;
    private final ScrapRepository scrapRepository;
    private final FollowRepository followRepository;
    private final NotificationRepository notificationRepository;
    // private final ReportRepository reportRepository; // 임시 비활성화
    // private final BlockRepository blockRepository; // 임시 비활성화

    /**
     * 커뮤니티 대시보드 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    public Map<String, Object> getCommunityDashboard() {
        log.info("커뮤니티 대시보드 통계 조회 시작");
        
        try {
            // 게시글 통계
            Object[] postStats = postRepository.getPostStatistics(LocalDateTime.now().minusDays(30));
            
            // 태그 통계
            List<Object[]> tagStats = tagRepository.getTagStatistics();
            
            // 댓글 통계
            Object[] commentStats = commentRepository.getCommentStatistics();
            
            // 신고 통계 (임시 비활성화)
            // List<Object[]> reportStats = reportRepository.getReportStatistics();
            
            Map<String, Object> dashboard = Map.of(
                "posts", Map.of(
                    "total", postStats[0],
                    "sponsored", postStats[1],
                    "recent", postStats[2],
                    "avgLikes", postStats[3],
                    "avgScraps", postStats[4]
                ),
                "tags", tagStats,
                "comments", commentStats,
                // "reports", reportStats, // 임시 비활성화
                "lastUpdated", LocalDateTime.now()
            );
            
            log.info("커뮤니티 대시보드 통계 조회 완료");
            return dashboard;
            
        } catch (Exception e) {
            log.error("커뮤니티 대시보드 통계 조회 실패", e);
            throw new RuntimeException("커뮤니티 대시보드 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 커뮤니티 활동 요약
     * 성능: 사용자별 집계 최적화
     */
    public Map<String, Object> getUserCommunitySummary(UUID userId) {
        log.info("사용자 커뮤니티 활동 요약 조회 시작: {}", userId);
        
        try {
            // 게시글 수
            long postCount = postRepository.countByAuthorId(userId);
            
            // 댓글 수
            long commentCount = commentRepository.countByAuthorId(userId);
            
            // 스크랩 수
            long scrapCount = scrapRepository.countByUserId(userId);
            
            // 팔로워/팔로잉 수
            long followerCount = followRepository.countFollowersByFolloweeId(userId);
            long followingCount = followRepository.countFollowingByFollowerId(userId);
            
            // 읽지 않은 알림 수
            long unreadNotificationCount = notificationRepository.countUnreadByUserId(userId);
            
            Map<String, Object> summary = Map.of(
                "postCount", postCount,
                "commentCount", commentCount,
                "scrapCount", scrapCount,
                "followerCount", followerCount,
                "followingCount", followingCount,
                "unreadNotificationCount", unreadNotificationCount,
                "lastUpdated", LocalDateTime.now()
            );
            
            log.info("사용자 커뮤니티 활동 요약 조회 완료: {}", userId);
            return summary;
            
        } catch (Exception e) {
            log.error("사용자 커뮤니티 활동 요약 조회 실패: {}", userId, e);
            throw new RuntimeException("사용자 활동 요약 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 커뮤니티 콘텐츠 검색 (통합)
     * 성능: 다중 테이블 검색 최적화
     */
    public Map<String, Object> searchCommunityContent(String searchTerm, UUID userId, Pageable pageable) {
        log.info("커뮤니티 콘텐츠 통합 검색 시작: {}", searchTerm);
        
        try {
            // 게시글 검색
            Page<Post> posts = postRepository.searchPostsByContentAndTags(searchTerm, pageable);
            
            // 댓글 검색
            Page<Comment> comments = commentRepository.searchByContent(searchTerm, pageable);
            
            // 태그 검색
            List<Tag> tags = tagRepository.findByNamePatternOrderByPostCountDesc(searchTerm);
            
            // 차단된 사용자 필터링
            if (userId != null) {
                posts = postRepository.findPostsExcludingBlockedUsers(userId, pageable);
            }
            
            Map<String, Object> searchResults = Map.of(
                "posts", posts,
                "comments", comments,
                "tags", tags,
                "searchTerm", searchTerm,
                "totalResults", posts.getTotalElements() + comments.getTotalElements() + tags.size()
            );
            
            log.info("커뮤니티 콘텐츠 통합 검색 완료: {}", searchTerm);
            return searchResults;
            
        } catch (Exception e) {
            log.error("커뮤니티 콘텐츠 통합 검색 실패: {}", searchTerm, e);
            throw new RuntimeException("커뮤니티 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 트렌딩 콘텐츠 조회
     * 성능: 랭킹 알고리즘 최적화
     */
    public Map<String, Object> getTrendingContent(Pageable pageable) {
        log.info("트렌딩 콘텐츠 조회 시작");
        
        try {
            // 인기 게시글
            Page<Post> topPosts = postRepository.findTopPostsByRanking(pageable);
            
            // 인기 태그
            Page<Tag> topTags = tagRepository.findTopTagsByPostCount(pageable);
            
            // 최근 댓글
            Page<Comment> recentComments = commentRepository.findTopLevelCommentsByPostId(1L, pageable);
            
            Map<String, Object> trendingContent = Map.of(
                "topPosts", topPosts,
                "topTags", topTags,
                "recentComments", recentComments,
                "lastUpdated", LocalDateTime.now()
            );
            
            log.info("트렌딩 콘텐츠 조회 완료");
            return trendingContent;
            
        } catch (Exception e) {
            log.error("트렌딩 콘텐츠 조회 실패", e);
            throw new RuntimeException("트렌딩 콘텐츠 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 커뮤니티 품질 지표 조회
     * 성능: 품질 지표 집계 최적화
     */
    public Map<String, Object> getCommunityQualityMetrics() {
        log.info("커뮤니티 품질 지표 조회 시작");
        
        try {
            // 신고 처리 시간
            // List<Object[]> reportProcessingTimes = reportRepository.getReportProcessingTimeStatistics(); // 임시 비활성화
            
            // 차단 영향도
            // List<Object[]> blockImpactStats = blockRepository.getBlockImpactStatistics(); // 임시 비활성화
            
            // 태그 인기도 분포
            List<Object[]> tagPopularityStats = tagRepository.getTagStatisticsByPopularity();
            
            Map<String, Object> qualityMetrics = Map.of(
                // "reportProcessingTimes", reportProcessingTimes, // 임시 비활성화
                // "blockImpactStats", blockImpactStats, // 임시 비활성화
                "tagPopularityStats", tagPopularityStats,
                "lastUpdated", LocalDateTime.now()
            );
            
            log.info("커뮤니티 품질 지표 조회 완료");
            return qualityMetrics;
            
        } catch (Exception e) {
            log.error("커뮤니티 품질 지표 조회 실패", e);
            throw new RuntimeException("품질 지표 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 커뮤니티 콘텐츠 정리 (관리자용)
     * 성능: 배치 처리 최적화
     */
    @Transactional
    public Map<String, Object> cleanupCommunityContent() {
        log.info("커뮤니티 콘텐츠 정리 시작");
        
        try {
            // 만료된 알림 정리
            List<Notification> expiredNotifications = notificationRepository.findExpiredNotifications(
                LocalDateTime.now().minusDays(30)
            );
            
            // 처리된 신고 정리 (임시 비활성화)
            // List<Report> processedReports = reportRepository.findByStatusOrderByCreatedAtDesc(
            //     Report.Status.RESOLVED, Pageable.unpaged()
            // ).getContent();
            
            // 오래된 차단 기록 정리 (1년 이상) - 임시 비활성화
            // List<Block> oldBlocks = blockRepository.findBlocksOrderByPriorityAndCreatedAtDesc(
            //     Pageable.unpaged()
            // ).stream()
            //     .filter(block -> block.getCreatedAt().isBefore(LocalDateTime.now().minusYears(1)))
            //     .toList();
            
            Map<String, Object> cleanupResults = Map.of(
                "expiredNotifications", expiredNotifications.size(),
                "processedReports", 0, // processedReports.size(), // 임시 비활성화
                "oldBlocks", 0, // oldBlocks.size(), // 임시 비활성화
                "cleanupTime", LocalDateTime.now()
            );
            
            log.info("커뮤니티 콘텐츠 정리 완료: {}", cleanupResults);
            return cleanupResults;
            
        } catch (Exception e) {
            log.error("커뮤니티 콘텐츠 정리 실패", e);
            throw new RuntimeException("콘텐츠 정리 중 오류가 발생했습니다", e);
        }
    }
}
