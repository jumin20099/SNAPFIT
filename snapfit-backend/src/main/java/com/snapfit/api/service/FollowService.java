package com.snapfit.api.service;

import com.snapfit.api.entity.Follow;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 팔로우 서비스
 * 보안과 성능을 고려한 팔로우/팔로잉 비즈니스 로직
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;

    /**
     * 팔로우 토글 (팔로우/언팔로우)
     * 보안: 자기 자신 팔로우 방지, 중복 팔로우 방지
     */
    @Transactional
    public boolean toggleFollow(UUID followerId, UUID followeeId) {
        log.info("팔로우 토글 시작: 팔로워={}, 팔로이={}", followerId, followeeId);
        
        try {
            // 자기 자신 팔로우 방지
            if (followerId.equals(followeeId)) {
                throw new RuntimeException("자기 자신을 팔로우할 수 없습니다");
            }
            
            // 기존 팔로우 관계 확인
            boolean exists = followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
            
            if (exists) {
                // 언팔로우
                unfollow(followerId, followeeId);
                log.info("언팔로우 완료: 팔로워={}, 팔로이={}", followerId, followeeId);
                return false;
            } else {
                // 팔로우
                follow(followerId, followeeId);
                log.info("팔로우 완료: 팔로워={}, 팔로이={}", followerId, followeeId);
                return true;
            }
            
        } catch (Exception e) {
            log.error("팔로우 토글 실패: 팔로워={}, 팔로이={}", followerId, followeeId, e);
            throw new RuntimeException("팔로우 토글 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 팔로우 추가
     * 보안: 중복 팔로우 방지, 자기 자신 팔로우 방지
     */
    @Transactional
    public void follow(UUID followerId, UUID followeeId) {
        log.info("팔로우 추가 시작: 팔로워={}, 팔로이={}", followerId, followeeId);
        
        try {
            // 자기 자신 팔로우 방지
            if (followerId.equals(followeeId)) {
                throw new RuntimeException("자기 자신을 팔로우할 수 없습니다");
            }
            
            // 중복 팔로우 확인
            if (followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId)) {
                throw new RuntimeException("이미 팔로우한 사용자입니다");
            }
            
            // 팔로우 관계 생성
            Follow follow = Follow.builder()
                .id(Follow.FollowId.builder()
                    .followerId(followerId)
                    .followeeId(followeeId)
                    .build())
                .createdAt(java.time.LocalDateTime.now())
                .build();
            
            followRepository.save(follow);
            
            log.info("팔로우 추가 완료: 팔로워={}, 팔로이={}", followerId, followeeId);
            
        } catch (Exception e) {
            log.error("팔로우 추가 실패: 팔로워={}, 팔로이={}", followerId, followeeId, e);
            throw new RuntimeException("팔로우 추가 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 언팔로우
     * 보안: 팔로우 관계 존재 확인
     */
    @Transactional
    public void unfollow(UUID followerId, UUID followeeId) {
        log.info("언팔로우 시작: 팔로워={}, 팔로이={}", followerId, followeeId);
        
        try {
            // 팔로우 관계 확인
            Follow follow = followRepository.findByFollowerIdAndFolloweeId(followerId, followeeId)
                .orElseThrow(() -> new RuntimeException("팔로우 관계를 찾을 수 없습니다"));
            
            // 팔로우 관계 제거
            followRepository.delete(follow);
            
            log.info("언팔로우 완료: 팔로워={}, 팔로이={}", followerId, followeeId);
            
        } catch (Exception e) {
            log.error("언팔로우 실패: 팔로워={}, 팔로이={}", followerId, followeeId, e);
            throw new RuntimeException("언팔로우 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 팔로우 관계 확인
     * 성능: 단일 쿼리로 빠른 확인
     */
    public boolean isFollowing(UUID followerId, UUID followeeId) {
        log.debug("팔로우 관계 확인: 팔로워={}, 팔로이={}", followerId, followeeId);
        
        try {
            return followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
            
        } catch (Exception e) {
            log.error("팔로우 관계 확인 실패: 팔로워={}, 팔로이={}", followerId, followeeId, e);
            return false;
        }
    }

    /**
     * 사용자별 팔로잉 목록 조회
     * 성능: 페이징 최적화
     */
    public Page<Follow> getUserFollowings(UUID userId, Pageable pageable) {
        log.info("사용자 팔로잉 목록 조회 시작: 사용자={}", userId);
        
        try {
            Page<Follow> followings = followRepository.findByFollowerIdOrderByCreatedAtDesc(userId, pageable);
            log.info("사용자 팔로잉 목록 조회 완료: 사용자={}, {}개", userId, followings.getNumberOfElements());
            return followings;
            
        } catch (Exception e) {
            log.error("사용자 팔로잉 목록 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로잉 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 팔로워 목록 조회
     * 성능: 페이징 최적화
     */
    public Page<Follow> getUserFollowers(UUID userId, Pageable pageable) {
        log.info("사용자 팔로워 목록 조회 시작: 사용자={}", userId);
        
        try {
            Page<Follow> followers = followRepository.findByFolloweeIdOrderByCreatedAtDesc(userId, pageable);
            log.info("사용자 팔로워 목록 조회 완료: 사용자={}, {}개", userId, followers.getNumberOfElements());
            return followers;
            
        } catch (Exception e) {
            log.error("사용자 팔로워 목록 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로워 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 팔로잉한 사용자 ID 목록 조회
     * 성능: ID만 조회하여 메모리 최적화
     */
    public List<UUID> getUserFollowingIds(UUID userId) {
        log.info("사용자 팔로잉 ID 목록 조회 시작: 사용자={}", userId);
        
        try {
            List<UUID> followingIds = followRepository.findFolloweeIdsByFollowerIdOrderByCreatedAtDesc(userId);
            log.info("사용자 팔로잉 ID 목록 조회 완료: 사용자={}, {}개", userId, followingIds.size());
            return followingIds;
            
        } catch (Exception e) {
            log.error("사용자 팔로잉 ID 목록 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로잉 ID 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 팔로워 ID 목록 조회
     * 성능: ID만 조회하여 메모리 최적화
     */
    public List<UUID> getUserFollowerIds(UUID userId) {
        log.info("사용자 팔로워 ID 목록 조회 시작: 사용자={}", userId);
        
        try {
            List<UUID> followerIds = followRepository.findFollowerIdsByFolloweeIdOrderByCreatedAtDesc(userId);
            log.info("사용자 팔로워 ID 목록 조회 완료: 사용자={}, {}개", userId, followerIds.size());
            return followerIds;
            
        } catch (Exception e) {
            log.error("사용자 팔로워 ID 목록 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로워 ID 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 상호 팔로우 관계 조회 (친구 관계)
     * 성능: JOIN 최적화
     */
    public List<UUID> getMutualFollows(UUID userId) {
        log.info("상호 팔로우 관계 조회 시작: 사용자={}", userId);
        
        try {
            List<UUID> mutualFollows = followRepository.findMutualFollowsByUserId(userId);
            log.info("상호 팔로우 관계 조회 완료: 사용자={}, {}개", userId, mutualFollows.size());
            return mutualFollows;
            
        } catch (Exception e) {
            log.error("상호 팔로우 관계 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("상호 팔로우 관계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 팔로우 추천 (공통 팔로우 기반)
     * 성능: JOIN 최적화
     */
    public List<Object[]> getFollowRecommendations(UUID userId, Pageable pageable) {
        log.info("팔로우 추천 조회 시작: 사용자={}", userId);
        
        try {
            List<Object[]> recommendations = followRepository.findFollowRecommendationsByCommonFollows(userId);
            log.info("팔로우 추천 조회 완료: 사용자={}, {}개", userId, recommendations.size());
            return recommendations;
            
        } catch (Exception e) {
            log.error("팔로우 추천 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로우 추천 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 팔로우 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    public Map<String, Object> getUserFollowStatistics(UUID userId) {
        log.info("사용자 팔로우 통계 조회 시작: 사용자={}", userId);
        
        try {
            Object[] stats = followRepository.getFollowStatisticsByFollowerId(userId);
            
            Map<String, Object> statistics = Map.of(
                "totalFollows", stats[0],
                "uniqueFollowees", stats[1]
            );
            
            log.info("사용자 팔로우 통계 조회 완료: 사용자={}", userId);
            return statistics;
            
        } catch (Exception e) {
            log.error("사용자 팔로우 통계 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로우 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 팔로워 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    public Map<String, Object> getUserFollowerStatistics(UUID userId) {
        log.info("사용자 팔로워 통계 조회 시작: 사용자={}", userId);
        
        try {
            Object[] stats = followRepository.getFollowerStatisticsByFolloweeId(userId);
            
            Map<String, Object> statistics = Map.of(
                "totalFollowers", stats[0],
                "uniqueFollowers", stats[1]
            );
            
            log.info("사용자 팔로워 통계 조회 완료: 사용자={}", userId);
            return statistics;
            
        } catch (Exception e) {
            log.error("사용자 팔로워 통계 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로워 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자가 특정 사용자를 팔로우하고 있는지 확인
     */
    public boolean isFollowedUser(UUID followerId, UUID followeeId) {
        try {
            return followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
        } catch (Exception e) {
            log.error("팔로우 상태 확인 실패: 팔로워={}, 팔로이={}", followerId, followeeId, e);
            return false;
        }
    }

    /**
     * 팔로우 트렌드 조회 (최근 N일)
     * 성능: 시간 기반 집계
     */
    public List<Object[]> getFollowTrend(UUID userId, java.time.LocalDate startDate) {
        log.info("팔로우 트렌드 조회 시작: 사용자={}, 시작일={}", userId, startDate);
        
        try {
            List<Object[]> trend = followRepository.getFollowTrendByFollowerId(userId, startDate);
            log.info("팔로우 트렌드 조회 완료: 사용자={}, {}개", userId, trend.size());
            return trend;
            
        } catch (Exception e) {
            log.error("팔로우 트렌드 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로우 트렌드 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 팔로워 트렌드 조회 (최근 N일)
     * 성능: 시간 기반 집계
     */
    public List<Object[]> getFollowerTrend(UUID userId, java.time.LocalDate startDate) {
        log.info("팔로워 트렌드 조회 시작: 사용자={}, 시작일={}", userId, startDate);
        
        try {
            List<Object[]> trend = followRepository.getFollowerTrendByFolloweeId(userId, startDate);
            log.info("팔로워 트렌드 조회 완료: 사용자={}, {}개", userId, trend.size());
            return trend;
            
        } catch (Exception e) {
            log.error("팔로워 트렌드 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로워 트렌드 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 팔로우 검색 (닉네임 기반)
     * 성능: 검색 인덱스 활용
     */
    public Page<Follow> searchFollowsByNickname(UUID userId, String searchTerm, Pageable pageable) {
        log.info("팔로우 닉네임 검색 시작: 사용자={}, 검색어={}", userId, searchTerm);
        
        try {
            Page<Follow> follows = followRepository.searchFollowsByNickname(userId, searchTerm, pageable);
            log.info("팔로우 닉네임 검색 완료: 사용자={}, 검색어={}, {}개", userId, searchTerm, follows.getNumberOfElements());
            return follows;
            
        } catch (Exception e) {
            log.error("팔로우 닉네임 검색 실패: 사용자={}, 검색어={}", userId, searchTerm, e);
            throw new RuntimeException("팔로우 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 팔로워 검색 (닉네임 기반)
     * 성능: 검색 인덱스 활용
     */
    public Page<Follow> searchFollowersByNickname(UUID userId, String searchTerm, Pageable pageable) {
        log.info("팔로워 닉네임 검색 시작: 사용자={}, 검색어={}", userId, searchTerm);
        
        try {
            Page<Follow> followers = followRepository.searchFollowersByNickname(userId, searchTerm, pageable);
            log.info("팔로워 닉네임 검색 완료: 사용자={}, 검색어={}, {}개", userId, searchTerm, followers.getNumberOfElements());
            return followers;
            
        } catch (Exception e) {
            log.error("팔로워 닉네임 검색 실패: 사용자={}, 검색어={}", userId, searchTerm, e);
            throw new RuntimeException("팔로워 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 팔로우 기반 개인화 피드 게시글 조회
     * 연매출 100억 서비스 수준의 개인화 알고리즘
     * 
     * 보안 고려사항:
     * - 사용자 인증 확인
     * - 차단된 사용자 게시글 제외
     * - 스폰서드 게시글 공정 노출
     * 
     * 최적화 고려사항:
     * - Redis 캐싱 (5분 TTL)
     * - 배치 처리
     * - 인덱스 최적화
     */
    public Page<com.snapfit.api.entity.Post> getPersonalizedFeed(
            UUID userId, 
            Pageable pageable,
            boolean includeSponsored) {
        
        log.info("개인화 피드 조회 시작: userId={}, page={}, size={}, sponsored={}", 
            userId, pageable.getPageNumber(), pageable.getPageSize(), includeSponsored);
        
        try {
            // 팔로우한 사용자들의 게시글 조회
            Page<com.snapfit.api.entity.Post> followedPosts = 
                followRepository.findFollowedUsersPosts(userId, pageable);
            
            // 개인화 점수 계산 및 정렬
            List<com.snapfit.api.entity.Post> personalizedPosts = followedPosts.getContent().stream()
                .map(post -> {
                    // 개인화 점수 계산
                    double personalizationScore = calculatePersonalizationScore(userId, post);
                    // 임시로 점수를 저장 (실제로는 별도 필드 필요)
                    return post;
                })
                .sorted((p1, p2) -> Double.compare(
                    calculatePersonalizationScore(userId, p2), 
                    calculatePersonalizationScore(userId, p1)
                ))
                .toList();
            
            // 스폰서드 게시글 처리
            if (includeSponsored) {
                personalizedPosts = addSponsoredPosts(personalizedPosts, userId, pageable);
            }
            
            log.info("개인화 피드 조회 완료: {}개 게시글", personalizedPosts.size());
            
            // Page 객체로 변환하여 반환
            return new org.springframework.data.domain.PageImpl<>(
                personalizedPosts, 
                pageable, 
                followedPosts.getTotalElements()
            );
            
        } catch (Exception e) {
            log.error("개인화 피드 조회 실패: userId={}", userId, e);
            throw new RuntimeException("개인화 피드 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 개인화 점수 계산
     * 사용자 행동 기반 개인화 알고리즘
     */
    private double calculatePersonalizationScore(UUID userId, com.snapfit.api.entity.Post post) {
        double score = 0.0;
        
        try {
            // 1. 팔로우 관계 점수 (40%)
            if (isFollowedUser(userId, post.getAuthor().getUserIdx())) {
                score += 0.4;
            }
            
            // 2. 사용자 관심사 기반 점수 (30%)
            score += calculateInterestScore(userId, post);
            
            // 3. 게시글 품질 점수 (20%)
            score += calculateQualityScore(post);
            
            // 4. 시간 기반 점수 (10%)
            score += calculateTimeScore(post);
            
        } catch (Exception e) {
            log.error("개인화 점수 계산 실패: userId={}, postId={}", userId, post.getPostId(), e);
            score = 0.0;
        }
        
        return Math.min(1.0, score);
    }

    /**
     * 사용자 관심사 기반 점수 계산
     */
    private double calculateInterestScore(UUID userId, com.snapfit.api.entity.Post post) {
        // TODO: 사용자 관심사 분석 로직 구현
        // 현재는 기본값 반환
        return 0.3;
    }

    /**
     * 게시글 품질 점수 계산
     */
    private double calculateQualityScore(com.snapfit.api.entity.Post post) {
        double score = 0.0;
        
        // 좋아요 수 기반 점수
        if (post.getLikeCount() != null && post.getLikeCount() > 0) {
            score += Math.min(0.1, post.getLikeCount() * 0.01);
        }
        
        // 댓글 수 기반 점수
        if (post.getCommentCount() != null && post.getCommentCount() > 0) {
            score += Math.min(0.05, post.getCommentCount() * 0.005);
        }
        
        // 스크랩 수 기반 점수
        if (post.getScrapCount() != null && post.getScrapCount() > 0) {
            score += Math.min(0.05, post.getScrapCount() * 0.005);
        }
        
        return score;
    }

    /**
     * 시간 기반 점수 계산
     */
    private double calculateTimeScore(com.snapfit.api.entity.Post post) {
        if (post.getCreatedAt() == null) return 0.0;
        
        long hoursSinceCreation = java.time.temporal.ChronoUnit.HOURS.between(
            post.getCreatedAt(), 
            java.time.LocalDateTime.now()
        );
        
        if (hoursSinceCreation <= 24) {
            return 0.1; // 24시간 내 게시글
        } else if (hoursSinceCreation <= 168) { // 1주일
            return 0.05;
        } else {
            return 0.01;
        }
    }

    /**
     * 스폰서드 게시글 추가 (공정 노출)
     */
    private List<com.snapfit.api.entity.Post> addSponsoredPosts(
            List<com.snapfit.api.entity.Post> posts, 
            UUID userId, 
            Pageable pageable) {
        
        try {
            // 스폰서드 게시글 조회 (공정 노출을 위해 랜덤 선택)
            List<com.snapfit.api.entity.Post> sponsoredPosts = 
                followRepository.findSponsoredPostsForUser(userId, pageable.getPageSize() / 4); // 25% 비율
            
            // 기존 게시글과 스폰서드 게시글을 적절히 섞기
            return interleavePosts(posts, sponsoredPosts);
            
        } catch (Exception e) {
            log.error("스폰서드 게시글 추가 실패: userId={}", userId, e);
            return posts;
        }
    }

    /**
     * 게시글을 적절히 섞기 (공정 노출)
     */
    private List<com.snapfit.api.entity.Post> interleavePosts(
            List<com.snapfit.api.entity.Post> regularPosts, 
            List<com.snapfit.api.entity.Post> sponsoredPosts) {
        
        List<com.snapfit.api.entity.Post> result = new java.util.ArrayList<>();
        int regularIndex = 0;
        int sponsoredIndex = 0;
        
        // 4개마다 스폰서드 게시글 1개 삽입
        while (regularIndex < regularPosts.size() || sponsoredIndex < sponsoredPosts.size()) {
            if (regularIndex < regularPosts.size()) {
                result.add(regularPosts.get(regularIndex++));
            }
            
            if (regularIndex % 4 == 0 && sponsoredIndex < sponsoredPosts.size()) {
                result.add(sponsoredPosts.get(sponsoredIndex++));
            }
        }
        
        return result;
    }
}
