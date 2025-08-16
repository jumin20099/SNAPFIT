package com.snapfit.api.service;

import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.Scrap;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.PostRepository;
import com.snapfit.api.repository.ScrapRepository;
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
 * 스크랩 서비스
 * 보안과 성능을 고려한 스크랩 비즈니스 로직
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScrapService {

    private final ScrapRepository scrapRepository;
    private final PostRepository postRepository;

    /**
     * 스크랩 토글 (추가/제거)
     * 보안: 중복 스크랩 방지, 권한 확인
     */
    @Transactional
    public boolean toggleScrap(UUID userId, Long postId) {
        log.info("스크랩 토글 시작: 사용자={}, 게시글={}", userId, postId);
        
        try {
            // 기존 스크랩 확인
            boolean exists = scrapRepository.existsByUserIdAndPostId(userId, postId);
            
            if (exists) {
                // 스크랩 제거
                removeScrap(userId, postId);
                log.info("스크랩 제거 완료: 사용자={}, 게시글={}", userId, postId);
                return false;
            } else {
                // 스크랩 추가
                addScrap(userId, postId);
                log.info("스크랩 추가 완료: 사용자={}, 게시글={}", userId, postId);
                return true;
            }
            
        } catch (Exception e) {
            log.error("스크랩 토글 실패: 사용자={}, 게시글={}", userId, postId, e);
            throw new RuntimeException("스크랩 토글 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 스크랩 추가
     * 보안: 중복 방지, 게시글 존재 확인
     */
    @Transactional
    public void addScrap(UUID userId, Long postId) {
        log.info("스크랩 추가 시작: 사용자={}, 게시글={}", userId, postId);
        
        try {
            // 게시글 존재 확인
            if (!postRepository.existsActivePost(postId)) {
                throw new RuntimeException("존재하지 않는 게시글입니다");
            }
            
            // 중복 스크랩 확인
            if (scrapRepository.existsByUserIdAndPostId(userId, postId)) {
                throw new RuntimeException("이미 스크랩한 게시글입니다");
            }
            
            // 스크랩 생성
            Scrap scrap = Scrap.builder()
                .id(Scrap.ScrapId.builder()
                    .userId(userId)
                    .postId(postId)
                    .build())
                .createdAt(java.time.LocalDateTime.now())
                .build();
            
            scrapRepository.save(scrap);
            
            // 게시글 스크랩 수 증가
            postRepository.incrementScrapCount(postId);
            
            log.info("스크랩 추가 완료: 사용자={}, 게시글={}", userId, postId);
            
        } catch (Exception e) {
            log.error("스크랩 추가 실패: 사용자={}, 게시글={}", userId, postId, e);
            throw new RuntimeException("스크랩 추가 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 스크랩 제거
     * 보안: 소유자 확인, 게시글 스크랩 수 감소
     */
    @Transactional
    public void removeScrap(UUID userId, Long postId) {
        log.info("스크랩 제거 시작: 사용자={}, 게시글={}", userId, postId);
        
        try {
            // 스크랩 존재 확인
            Scrap scrap = scrapRepository.findByUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new RuntimeException("스크랩을 찾을 수 없습니다"));
            
            // 스크랩 제거
            scrapRepository.delete(scrap);
            
            // 게시글 스크랩 수 감소
            postRepository.decrementScrapCount(postId);
            
            log.info("스크랩 제거 완료: 사용자={}, 게시글={}", userId, postId);
            
        } catch (Exception e) {
            log.error("스크랩 제거 실패: 사용자={}, 게시글={}", userId, postId, e);
            throw new RuntimeException("스크랩 제거 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 스크랩 목록 조회
     * 성능: 페이징 최적화
     */
    public Page<Scrap> getUserScraps(UUID userId, Pageable pageable) {
        log.info("사용자 스크랩 목록 조회 시작: 사용자={}", userId);
        
        try {
            Page<Scrap> scraps = scrapRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
            log.info("사용자 스크랩 목록 조회 완료: 사용자={}, {}개", userId, scraps.getNumberOfElements());
            return scraps;
            
        } catch (Exception e) {
            log.error("사용자 스크랩 목록 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("스크랩 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 스크랩한 게시글 ID 목록 조회
     * 성능: ID만 조회하여 메모리 최적화
     */
    public List<Long> getUserScrapedPostIds(UUID userId) {
        log.info("사용자 스크랩 게시글 ID 목록 조회 시작: 사용자={}", userId);
        
        try {
            List<Long> postIds = scrapRepository.findPostIdsByUserIdOrderByCreatedAtDesc(userId);
            log.info("사용자 스크랩 게시글 ID 목록 조회 완료: 사용자={}, {}개", userId, postIds.size());
            return postIds;
            
        } catch (Exception e) {
            log.error("사용자 스크랩 게시글 ID 목록 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("스크랩 게시글 ID 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글별 스크랩한 사용자 목록 조회
     * 성능: 페이징 최적화
     */
    public List<UUID> getPostScrapedUserIds(Long postId) {
        log.info("게시글 스크랩 사용자 목록 조회 시작: 게시글={}", postId);
        
        try {
            List<UUID> userIds = scrapRepository.findUserIdsByPostIdOrderByCreatedAtDesc(postId);
            log.info("게시글 스크랩 사용자 목록 조회 완료: 게시글={}, {}개", postId, userIds.size());
            return userIds;
            
        } catch (Exception e) {
            log.error("게시글 스크랩 사용자 목록 조회 실패: 게시글={}", postId, e);
            throw new RuntimeException("스크랩 사용자 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 스크랩 여부 확인
     * 성능: 단일 쿼리로 빠른 확인
     */
    public boolean isScraped(UUID userId, Long postId) {
        log.debug("스크랩 여부 확인: 사용자={}, 게시글={}", userId, postId);
        
        try {
            return scrapRepository.existsByUserIdAndPostId(userId, postId);
            
        } catch (Exception e) {
            log.error("스크랩 여부 확인 실패: 사용자={}, 게시글={}", userId, postId, e);
            return false;
        }
    }

    /**
     * 사용자별 스크랩 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    public Map<String, Object> getUserScrapStatistics(UUID userId) {
        log.info("사용자 스크랩 통계 조회 시작: 사용자={}", userId);
        
        try {
            Object[] stats = scrapRepository.getScrapStatisticsByUserId(userId);
            
            Map<String, Object> statistics = Map.of(
                "totalScraps", stats[0],
                "uniquePosts", stats[1],
                "uniqueAuthors", stats[2]
            );
            
            log.info("사용자 스크랩 통계 조회 완료: 사용자={}", userId);
            return statistics;
            
        } catch (Exception e) {
            log.error("사용자 스크랩 통계 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("스크랩 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글별 스크랩 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    public Map<String, Object> getPostScrapStatistics(Long postId) {
        log.info("게시글 스크랩 통계 조회 시작: 게시글={}", postId);
        
        try {
            Object[] stats = scrapRepository.getScrapStatisticsByPostId(postId);
            
            Map<String, Object> statistics = Map.of(
                "totalScraps", stats[0],
                "uniqueUsers", stats[1]
            );
            
            log.info("게시글 스크랩 통계 조회 완료: 게시글={}", postId);
            return statistics;
            
        } catch (Exception e) {
            log.error("게시글 스크랩 통계 조회 실패: 게시글={}", postId, e);
            throw new RuntimeException("스크랩 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 스크랩한 태그 통계 조회
     * 성능: JOIN 최적화
     */
    public List<Object[]> getUserScrapTagStatistics(UUID userId) {
        log.info("사용자 스크랩 태그 통계 조회 시작: 사용자={}", userId);
        
        try {
            List<Object[]> tagStats = scrapRepository.getScrapTagStatisticsByUserId(userId);
            log.info("사용자 스크랩 태그 통계 조회 완료: 사용자={}, {}개", userId, tagStats.size());
            return tagStats;
            
        } catch (Exception e) {
            log.error("사용자 스크랩 태그 통계 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("스크랩 태그 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 스크랩한 작성자 통계 조회
     * 성능: JOIN 최적화
     */
    public List<Object[]> getUserScrapAuthorStatistics(UUID userId) {
        log.info("사용자 스크랩 작성자 통계 조회 시작: 사용자={}", userId);
        
        try {
            List<Object[]> authorStats = scrapRepository.getScrapAuthorStatisticsByUserId(userId);
            log.info("사용자 스크랩 작성자 통계 조회 완료: 사용자={}, {}개", userId, authorStats.size());
            return authorStats;
            
        } catch (Exception e) {
            log.error("사용자 스크랩 작성자 통계 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("스크랩 작성자 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 스크랩 검색 (내용 기반)
     * 성능: 검색 인덱스 활용
     */
    public Page<Scrap> searchScrapsByContent(UUID userId, String searchTerm, Pageable pageable) {
        log.info("스크랩 내용 검색 시작: 사용자={}, 검색어={}", userId, searchTerm);
        
        try {
            Page<Scrap> scraps = scrapRepository.searchScrapsByContentAndTags(userId, searchTerm, pageable);
            log.info("스크랩 내용 검색 완료: 사용자={}, 검색어={}, {}개", userId, searchTerm, scraps.getNumberOfElements());
            return scraps;
            
        } catch (Exception e) {
            log.error("스크랩 내용 검색 실패: 사용자={}, 검색어={}", userId, searchTerm, e);
            throw new RuntimeException("스크랩 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 스크랩 필터링 (태그 기반)
     * 성능: 태그 인덱스 활용
     */
    public Page<Scrap> filterScrapsByTag(UUID userId, String tagName, Pageable pageable) {
        log.info("스크랩 태그 필터링 시작: 사용자={}, 태그={}", userId, tagName);
        
        try {
            Page<Scrap> scraps = scrapRepository.findScrapsByTagName(userId, tagName, pageable);
            log.info("스크랩 태그 필터링 완료: 사용자={}, 태그={}, {}개", userId, tagName, scraps.getNumberOfElements());
            return scraps;
            
        } catch (Exception e) {
            log.error("스크랩 태그 필터링 실패: 사용자={}, 태그={}", userId, tagName, e);
            throw new RuntimeException("스크랩 태그 필터링 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 스크랩 정렬 (다양한 기준)
     * 성능: 정렬 인덱스 활용
     */
    public Page<Scrap> getScrapsWithSorting(UUID userId, String sortBy, Pageable pageable) {
        log.info("스크랩 정렬 조회 시작: 사용자={}, 정렬={}", userId, sortBy);
        
        try {
            Page<Scrap> scraps;
            
            switch (sortBy.toLowerCase()) {
                case "likes":
                    scraps = scrapRepository.findScrapsOrderByLikeCount(userId, pageable);
                    break;
                case "scraps":
                    scraps = scrapRepository.findScrapsOrderByScrapCount(userId, pageable);
                    break;
                case "comments":
                    scraps = scrapRepository.findScrapsOrderByCommentCount(userId, pageable);
                    break;
                case "views":
                    scraps = scrapRepository.findScrapsOrderByViewCount(userId, pageable);
                    break;
                default:
                    scraps = scrapRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
            }
            
            log.info("스크랩 정렬 조회 완료: 사용자={}, 정렬={}, {}개", userId, sortBy, scraps.getNumberOfElements());
            return scraps;
            
        } catch (Exception e) {
            log.error("스크랩 정렬 조회 실패: 사용자={}, 정렬={}", userId, sortBy, e);
            throw new RuntimeException("스크랩 정렬 조회 중 오류가 발생했습니다", e);
        }
    }
}
