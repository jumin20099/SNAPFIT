package com.snapfit.api.service;

import com.snapfit.api.entity.Tag;
import com.snapfit.api.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 태그 서비스
 * 보안과 성능을 고려한 태그 비즈니스 로직
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;

    // 태그 정규식 패턴 (한글, 영문, 숫자, 언더스코어, 하이픈)
    private static final Pattern TAG_PATTERN = Pattern.compile("^[가-힣a-zA-Z0-9_-]+$");
    private static final int MAX_TAG_LENGTH = 20;
    private static final int MIN_TAG_LENGTH = 1;

    /**
     * 태그 생성 또는 조회
     * 보안: 태그 유효성 검증, 정규화
     */
    @Transactional
    public Tag createOrGetTag(String tagName) {
        log.info("태그 생성 또는 조회 시작: 태그명={}", tagName);
        
        try {
            // 태그명 정규화
            String normalizedTagName = normalizeTagName(tagName);
            
            // 태그 유효성 검증
            validateTagName(normalizedTagName);
            
            // 기존 태그 조회 또는 새로 생성
            Tag tag = tagRepository.findByName(normalizedTagName)
                .orElse(Tag.builder()
                    .name(normalizedTagName)
                    .postCount(0L)
                    .createdAt(LocalDateTime.now())
                    .build());
            
            // 새로 생성된 태그인 경우 저장
            if (tag.getTagId() == null) {
                tag = tagRepository.save(tag);
                log.info("새 태그 생성 완료: ID={}, 태그명={}", tag.getTagId(), normalizedTagName);
            }
            
            log.info("태그 생성 또는 조회 완료: ID={}, 태그명={}", tag.getTagId(), normalizedTagName);
            return tag;
            
        } catch (Exception e) {
            log.error("태그 생성 또는 조회 실패: 태그명={}", tagName, e);
            throw new RuntimeException("태그 생성 또는 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그명 정규화
     * 보안: 공백 제거, 소문자 변환, 특수문자 처리
     */
    private String normalizeTagName(String tagName) {
        if (!StringUtils.hasText(tagName)) {
            throw new RuntimeException("태그명이 비어있습니다");
        }
        
        return tagName.trim()
            .toLowerCase()
            .replaceAll("\\s+", "_");
    }

    /**
     * 태그명 유효성 검증
     * 보안: 길이 제한, 패턴 검증
     */
    private void validateTagName(String tagName) {
        if (tagName.length() < MIN_TAG_LENGTH || tagName.length() > MAX_TAG_LENGTH) {
            throw new RuntimeException("태그명은 " + MIN_TAG_LENGTH + "-" + MAX_TAG_LENGTH + "자 사이여야 합니다");
        }
        
        if (!TAG_PATTERN.matcher(tagName).matches()) {
            throw new RuntimeException("태그명은 한글, 영문, 숫자, 언더스코어, 하이픈만 사용 가능합니다");
        }
    }

    /**
     * 태그 수정
     * 보안: 기존 태그와의 충돌 방지
     */
    @Transactional
    public Tag updateTag(Long tagId, String newTagName) {
        log.info("태그 수정 시작: ID={}, 새 태그명={}", tagId, newTagName);
        
        try {
            Tag existingTag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("태그를 찾을 수 없습니다"));
            
            // 새 태그명 정규화 및 검증
            String normalizedNewName = normalizeTagName(newTagName);
            validateTagName(normalizedNewName);
            
            // 기존 태그명과 동일한지 확인
            if (existingTag.getName().equals(normalizedNewName)) {
                log.info("태그명이 동일하여 수정 불필요: ID={}", tagId);
                return existingTag;
            }
            
            // 새 태그명이 이미 존재하는지 확인
            Optional<Tag> duplicateTag = tagRepository.findByName(normalizedNewName);
            if (duplicateTag.isPresent()) {
                throw new RuntimeException("이미 존재하는 태그명입니다");
            }
            
            // 태그명 업데이트
            existingTag.setName(normalizedNewName);

            
            Tag updatedTag = tagRepository.save(existingTag);
            
            log.info("태그 수정 완료: ID={}, 기존명={}, 새명={}", tagId, existingTag.getName(), normalizedNewName);
            return updatedTag;
            
        } catch (Exception e) {
            log.error("태그 수정 실패: ID={}, 새 태그명={}", tagId, newTagName, e);
            throw new RuntimeException("태그 수정 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그 삭제 (Soft Delete)
     * 보안: 연관 게시글 확인
     */
    @Transactional
    public void deleteTag(Long tagId) {
        log.info("태그 삭제 시작: ID={}", tagId);
        
        try {
            Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("태그를 찾을 수 없습니다"));
            
            // 연관 게시글 확인
            if (tag.getPostCount() > 0) {
                throw new RuntimeException("연관된 게시글이 있어 삭제할 수 없습니다");
            }
            
            // Soft Delete
            tagRepository.delete(tag);
            
            log.info("태그 삭제 완료: ID={}", tagId);
            
        } catch (Exception e) {
            log.error("태그 삭제 실패: ID={}", tagId, e);
            throw new RuntimeException("태그 삭제 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그 조회
     * 성능: 단일 쿼리 최적화
     */
    public Tag getTag(Long tagId) {
        log.info("태그 조회 시작: ID={}", tagId);
        
        try {
            Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("태그를 찾을 수 없습니다"));
            
            log.info("태그 조회 완료: ID={}, 태그명={}", tagId, tag.getName());
            return tag;
            
        } catch (Exception e) {
            log.error("태그 조회 실패: ID={}", tagId, e);
            throw new RuntimeException("태그 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그명으로 태그 조회
     * 성능: 인덱스 활용
     */
    public Optional<Tag> getTagByName(String tagName) {
        log.debug("태그명으로 태그 조회: 태그명={}", tagName);
        
        try {
            String normalizedTagName = normalizeTagName(tagName);
            return tagRepository.findByName(normalizedTagName);
            
        } catch (Exception e) {
            log.error("태그명으로 태그 조회 실패: 태그명={}", tagName, e);
            return Optional.empty();
        }
    }

    /**
     * 인기 태그 조회 (게시글 수 기준)
     * 성능: 인덱스 활용
     */
    public Page<Tag> getTopTags(Pageable pageable) {
        log.info("인기 태그 조회 시작");
        
        try {
            Page<Tag> tags = tagRepository.findTopTagsByPostCount(pageable);
            log.info("인기 태그 조회 완료: {}개", tags.getNumberOfElements());
            return tags;
            
        } catch (Exception e) {
            log.error("인기 태그 조회 실패", e);
            throw new RuntimeException("인기 태그 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그 검색 (패턴 기반)
     * 성능: pg_trgm 인덱스 활용
     */
    public List<Tag> searchTags(String searchTerm) {
        log.info("태그 검색 시작: 검색어={}", searchTerm);
        
        try {
            List<Tag> tags = tagRepository.findByNamePatternOrderByPostCountDesc(searchTerm);
            log.info("태그 검색 완료: 검색어={}, {}개", searchTerm, tags.size());
            return tags;
            
        } catch (Exception e) {
            log.error("태그 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("태그 검색 중 오류가 발생했습니다", e);
        }
    }



    /**
     * 태그 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    public Map<String, Object> getTagStatistics() {
        log.info("태그 통계 조회 시작");
        
        try {
            List<Object[]> stats = tagRepository.getTagStatistics();
            
            Map<String, Object> statistics = Map.of(
                "totalTags", stats.size(),
                "tagDistribution", stats
            );
            
            log.info("태그 통계 조회 완료");
            return statistics;
            
        } catch (Exception e) {
            log.error("태그 통계 조회 실패", e);
            throw new RuntimeException("태그 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그별 인기도 통계 조회
     * 성능: 인기도 분포 집계
     */
    public List<Object[]> getTagPopularityStatistics() {
        log.info("태그 인기도 통계 조회 시작");
        
        try {
            List<Object[]> popularityStats = tagRepository.getTagStatisticsByPopularity();
            log.info("태그 인기도 통계 조회 완료: {}개", popularityStats.size());
            return popularityStats;
            
        } catch (Exception e) {
            log.error("태그 인기도 통계 조회 실패", e);
            throw new RuntimeException("태그 인기도 통계 조회 중 오류가 발생했습니다", e);
        }
    }



    /**
     * 태그 병합 (중복 태그 정리)
     * 보안: 데이터 무결성 보장
     */
    @Transactional
    public void mergeTags(Long primaryTagId, List<Long> secondaryTagIds) {
        log.info("태그 병합 시작: 주태그={}, 병합태그={}", primaryTagId, secondaryTagIds);
        
        try {
            Tag primaryTag = tagRepository.findById(primaryTagId)
                .orElseThrow(() -> new RuntimeException("주태그를 찾을 수 없습니다"));
            
            // 병합할 태그들 조회
            List<Tag> secondaryTags = tagRepository.findAllById(secondaryTagIds);
            
            // 게시글 수 합계 계산
            long totalPostCount = primaryTag.getPostCount();
            for (Tag secondaryTag : secondaryTags) {
                totalPostCount += secondaryTag.getPostCount();
            }
            
            // 주태그 업데이트
            primaryTag.setPostCount(totalPostCount);
            tagRepository.save(primaryTag);
            
            // 병합할 태그들 삭제
            for (Tag secondaryTag : secondaryTags) {
                tagRepository.delete(secondaryTag);
            }
            
            log.info("태그 병합 완료: 주태그={}, 병합된 게시글 수={}", primaryTagId, totalPostCount);
            
        } catch (Exception e) {
            log.error("태그 병합 실패: 주태그={}, 병합태그={}", primaryTagId, secondaryTagIds, e);
            throw new RuntimeException("태그 병합 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그 정리 (사용되지 않는 태그)
     * 성능: 배치 처리 최적화
     */
    @Transactional
    public Map<String, Object> cleanupUnusedTags() {
        log.info("사용되지 않는 태그 정리 시작");
        
        try {
            // 게시글이 없는 태그들 조회 (postCount가 0인 태그들)
            List<Tag> allTags = tagRepository.findAll();
            List<Tag> unusedTags = allTags.stream()
                .filter(tag -> tag.getPostCount() == 0)
                .collect(Collectors.toList());
            
            // 삭제 처리
            for (Tag tag : unusedTags) {
                tagRepository.delete(tag);
            }
            
            Map<String, Object> cleanupResults = Map.of(
                "cleanedTags", unusedTags.size(),
                "cleanupTime", LocalDateTime.now()
            );
            
            log.info("사용되지 않는 태그 정리 완료: {}개", unusedTags.size());
            return cleanupResults;
            
        } catch (Exception e) {
            log.error("사용되지 않는 태그 정리 실패", e);
            throw new RuntimeException("태그 정리 중 오류가 발생했습니다", e);
        }
    }


}
