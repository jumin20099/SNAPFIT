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
}
