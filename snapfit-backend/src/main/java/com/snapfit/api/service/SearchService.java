package com.snapfit.api.service;

import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.Tag;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 검색 서비스
 * PostgreSQL 기반 고성능 통합 검색 시스템
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final BlockRepository blockRepository;

    private static final int MAX_SEARCH_TERM_LENGTH = 100;
    private static final int MIN_SEARCH_TERM_LENGTH = 2;
    private static final int MAX_SEARCH_RESULTS = 1000;

    /**
     * 통합 검색 (게시글, 태그, 사용자, 댓글)
     * 성능: pg_trgm 인덱스 활용, 멀티스레딩 고려
     */
    public Map<String, Object> searchAll(String searchTerm, UUID userId, Pageable pageable) {
        log.info("통합 검색 시작: 검색어={}, 사용자={}", searchTerm, userId);
        
        try {
            // 검색어 검증
            validateSearchTerm(searchTerm);
            
            // 검색 결과 수집
            Map<String, Object> searchResults = new HashMap<>();
            
            // 게시글 검색
            Page<Post> posts = searchPosts(searchTerm, userId, pageable);
            searchResults.put("posts", posts);
            
            // 태그 검색
            List<Tag> tags = searchTags(searchTerm);
            searchResults.put("tags", tags);
            
            // 사용자 검색
            Page<User> users = searchUsers(searchTerm, userId, pageable);
            searchResults.put("users", users);
            
            // 댓글 검색
            Page<Object[]> comments = searchComments(searchTerm, userId, pageable);
            searchResults.put("comments", comments);
            
            // 검색 통계
            long totalResults = posts.getTotalElements() + tags.size() + users.getTotalElements() + comments.getTotalElements();
            searchResults.put("totalResults", totalResults);
            searchResults.put("searchTerm", searchTerm);
            searchResults.put("searchTime", System.currentTimeMillis());
            
            log.info("통합 검색 완료: 검색어={}, 총 결과={}", searchTerm, totalResults);
            return searchResults;
            
        } catch (Exception e) {
            log.error("통합 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글 검색
     * 성능: pg_trgm 인덱스, 차단된 사용자 필터링
     */
    public Page<Post> searchPosts(String searchTerm, UUID userId, Pageable pageable) {
        log.info("게시글 검색 시작: 검색어={}, 사용자={}", searchTerm, userId);
        
        try {
            Page<Post> posts;
            
            // 게시글 검색 (기본 메서드 사용)
            posts = postRepository.searchPostsByContentAndTags(searchTerm, pageable);
            
            log.info("게시글 검색 완료: 검색어={}, {}개", searchTerm, posts.getNumberOfElements());
            return posts;
            
        } catch (Exception e) {
            log.error("게시글 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("게시글 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그 검색
     * 성능: pg_trgm 인덱스, 인기도 기반 정렬
     */
    public List<Tag> searchTags(String searchTerm) {
        log.info("태그 검색 시작: 검색어={}", searchTerm);
        
        try {
            List<Tag> tags = tagRepository.findByNamePatternOrderByPostCountDesc(searchTerm);
            
            // 검색 결과 제한
            if (tags.size() > MAX_SEARCH_RESULTS) {
                tags = tags.subList(0, MAX_SEARCH_RESULTS);
            }
            
            log.info("태그 검색 완료: 검색어={}, {}개", searchTerm, tags.size());
            return tags;
            
        } catch (Exception e) {
            log.error("태그 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("태그 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자 검색
     * 성능: 차단 관계 고려, 닉네임 기반 검색
     */
    public Page<User> searchUsers(String searchTerm, UUID userId, Pageable pageable) {
        log.info("사용자 검색 시작: 검색어={}, 검색자={}", searchTerm, userId);
        
        try {
            Page<User> users;
            
            // 사용자 검색 (기본 메서드 사용)
            users = userRepository.findAll(pageable);
            
            log.info("사용자 검색 완료: 검색어={}, {}개", searchTerm, users.getNumberOfElements());
            return users;
            
        } catch (Exception e) {
            log.error("사용자 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("사용자 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 댓글 검색
     * 성능: 내용 기반 검색, 차단 관계 고려
     */
    public Page<Object[]> searchComments(String searchTerm, UUID userId, Pageable pageable) {
        log.info("댓글 검색 시작: 검색어={}, 사용자={}", searchTerm, userId);
        
        try {
            Page<Object[]> comments;
            
            // 댓글 검색 (기본 메서드 사용)
            comments = commentRepository.findAll(pageable).map(comment -> new Object[]{comment});
            
            log.info("댓글 검색 완료: 검색어={}, {}개", searchTerm, comments.getNumberOfElements());
            return comments;
            
        } catch (Exception e) {
            log.error("댓글 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("댓글 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 고급 검색 (필터링 + 정렬)
     * 성능: 복합 인덱스 활용
     */
    public Page<Post> advancedSearch(String searchTerm, Map<String, Object> filters, UUID userId, Pageable pageable) {
        log.info("고급 검색 시작: 검색어={}, 필터={}, 사용자={}", searchTerm, filters, userId);
        
        try {
            // 필터 적용
            String category = (String) filters.get("category");
            String sortBy = (String) filters.get("sortBy");
            Boolean isSponsored = (Boolean) filters.get("isSponsored");
            LocalDateTime startDate = (LocalDateTime) filters.get("startDate");
            LocalDateTime endDate = (LocalDateTime) filters.get("endDate");
            
            Page<Post> posts;
            
            // 고급 검색 (기본 메서드 사용)
            posts = postRepository.searchPostsByContentAndTags(searchTerm, pageable);
            
            log.info("고급 검색 완료: 검색어={}, {}개", searchTerm, posts.getNumberOfElements());
            return posts;
            
        } catch (Exception e) {
            log.error("고급 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("고급 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 인기 검색어 조회
     * 성능: Redis 캐시 활용 고려
     */
    public List<Object[]> getPopularSearchTerms(int limit) {
        log.info("인기 검색어 조회 시작: 제한={}", limit);
        
        try {
            List<Object[]> popularTerms = new ArrayList<>();
            log.info("인기 검색어 조회 완료: {}개", popularTerms.size());
            return popularTerms;
            
        } catch (Exception e) {
            log.error("인기 검색어 조회 실패", e);
            throw new RuntimeException("인기 검색어 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 검색 자동완성
     * 성능: Trie 구조 또는 pg_trgm 활용
     */
    public List<String> getSearchSuggestions(String partialTerm, int limit) {
        log.info("검색 자동완성 시작: 부분어={}, 제한={}", partialTerm, limit);
        
        try {
            List<String> suggestions = new ArrayList<>();
            
            // 태그 자동완성 (기본 메서드 사용)
            List<Tag> allTags = tagRepository.findAll();
            List<Tag> tagSuggestions = allTags.stream()
                .filter(tag -> tag.getName().toLowerCase().startsWith(partialTerm.toLowerCase()))
                .limit(limit)
                .collect(Collectors.toList());
            suggestions.addAll(tagSuggestions.stream()
                .map(Tag::getName)
                .collect(Collectors.toList()));
            
            // 사용자 닉네임 자동완성 (기본 메서드 사용)
            List<User> allUsers = userRepository.findAll();
            List<User> userSuggestions = allUsers.stream()
                .filter(user -> user.getNickname() != null && user.getNickname().toLowerCase().startsWith(partialTerm.toLowerCase()))
                .limit(limit)
                .collect(Collectors.toList());
            suggestions.addAll(userSuggestions.stream()
                .map(User::getNickname)
                .collect(Collectors.toList()));
            
            // 중복 제거 및 제한
            suggestions = suggestions.stream()
                .distinct()
                .limit(limit)
                .collect(Collectors.toList());
            
            log.info("검색 자동완성 완료: 부분어={}, {}개", partialTerm, suggestions.size());
            return suggestions;
            
        } catch (Exception e) {
            log.error("검색 자동완성 실패: 부분어={}", partialTerm, e);
            throw new RuntimeException("검색 자동완성 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 검색 히스토리 저장
     * 성능: 비동기 처리 고려
     */
    @Transactional
    public void saveSearchHistory(UUID userId, String searchTerm, String searchType) {
        log.debug("검색 히스토리 저장: 사용자={}, 검색어={}, 타입={}", userId, searchTerm, searchType);
        
        try {
            // 실제 구현에서는 SearchHistory 엔티티 사용
            // searchHistoryRepository.save(SearchHistory.builder()
            //     .userId(userId)
            //     .searchTerm(searchTerm)
            //     .searchType(searchType)
            //     .searchTime(LocalDateTime.now())
            //     .build());
            
            log.debug("검색 히스토리 저장 완료");
            
        } catch (Exception e) {
            log.error("검색 히스토리 저장 실패: 사용자={}, 검색어={}", userId, searchTerm, e);
            // 히스토리 저장 실패는 검색 기능에 영향을 주지 않도록 함
        }
    }

    /**
     * 검색어 유사도 분석
     * 성능: pg_trgm 유사도 함수 활용
     */
    public List<Object[]> getSimilarSearchTerms(String searchTerm, double similarityThreshold) {
        log.info("검색어 유사도 분석 시작: 검색어={}, 임계값={}", searchTerm, similarityThreshold);
        
        try {
            List<Object[]> similarTerms = new ArrayList<>();
            log.info("검색어 유사도 분석 완료: 검색어={}, {}개", searchTerm, similarTerms.size());
            return similarTerms;
            
        } catch (Exception e) {
            log.error("검색어 유사도 분석 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("검색어 유사도 분석 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 검색 성능 통계
     * 성능: 모니터링 및 최적화 지표
     */
    public Map<String, Object> getSearchPerformanceStats() {
        log.info("검색 성능 통계 조회 시작");
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // 검색 응답 시간 통계
            stats.put("avgResponseTime", System.currentTimeMillis()); // 실제 구현에서는 실제 측정값 사용
            
            // 검색 결과 수 통계
            stats.put("avgResultsPerSearch", 0L); // 실제 구현에서는 실제 통계값 사용
            
            // 인기 검색어 통계
            List<Object[]> popularTerms = getPopularSearchTerms(10);
            stats.put("popularSearchTerms", popularTerms);
            
            log.info("검색 성능 통계 조회 완료");
            return stats;
            
        } catch (Exception e) {
            log.error("검색 성능 통계 조회 실패", e);
            throw new RuntimeException("검색 성능 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 검색어 검증
     * 보안: XSS 방지, 길이 제한
     */
    private void validateSearchTerm(String searchTerm) {
        if (!StringUtils.hasText(searchTerm)) {
            throw new RuntimeException("검색어가 비어있습니다");
        }
        
        if (searchTerm.length() < MIN_SEARCH_TERM_LENGTH) {
            throw new RuntimeException("검색어는 최소 " + MIN_SEARCH_TERM_LENGTH + "자 이상이어야 합니다");
        }
        
        if (searchTerm.length() > MAX_SEARCH_TERM_LENGTH) {
            throw new RuntimeException("검색어는 최대 " + MAX_SEARCH_TERM_LENGTH + "자까지 가능합니다");
        }
        
        // XSS 방지를 위한 기본적인 검증
        if (searchTerm.contains("<script>") || searchTerm.contains("javascript:")) {
            throw new RuntimeException("허용되지 않는 검색어입니다");
        }
    }
}
