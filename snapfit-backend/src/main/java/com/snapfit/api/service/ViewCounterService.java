package com.snapfit.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 상품 조회수 관리 서비스
 * 메모리 기반 간단한 조회수 처리 (SSE 전환 중)
 */
@Slf4j
@Service
public class ViewCounterService {

    // 메모리 기반 조회수 저장소
    private final ConcurrentHashMap<Long, AtomicLong> viewCounts = new ConcurrentHashMap<>();

    /**
     * 상품 조회수 증가
     */
    public void incrementViewCount(Long productId) {
        try {
            AtomicLong counter = viewCounts.computeIfAbsent(productId, k -> new AtomicLong(0));
            counter.incrementAndGet();
            
            log.debug("상품 조회수 증가: productId={}, count={}", productId, counter.get());
        } catch (Exception e) {
            log.error("상품 조회수 증가 실패: productId={}", productId, e);
        }
    }

    /**
     * 상품 조회수 조회
     */
    public Long getViewCount(Long productId) {
        try {
            AtomicLong counter = viewCounts.get(productId);
            return counter != null ? counter.get() : 0L;
        } catch (Exception e) {
            log.error("상품 조회수 조회 실패: productId={}", productId, e);
            return 0L;
        }
    }

    /**
     * 조회수 초기화 (테스트용)
     */
    public void resetViewCount(Long productId) {
        viewCounts.remove(productId);
        log.info("조회수 초기화: productId={}", productId);
    }
} 