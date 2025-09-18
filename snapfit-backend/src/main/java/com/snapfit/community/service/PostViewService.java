package com.snapfit.community.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostViewService {
    
    private final StringRedisTemplate redisTemplate;
    
    // Redis 키 패턴
    private static final String VIEW_COUNT_KEY = "post:view_count:";
    
    // 조회수 만료 시간 (30일)
    private static final Duration VIEW_COUNT_EXPIRE = Duration.ofDays(30);
    
    /**
     * 게시글 조회수 증가 (매번 증가)
     * 
     * @param postId 게시글 ID
     * @return true: 조회수 증가됨
     */
    public boolean incrementViewCount(Long postId) {
        try {
            String viewCountKey = VIEW_COUNT_KEY + postId;
            log.info("조회수 증가 시작: postId={}, key={}", postId, viewCountKey);
            
            // 단순한 Redis INCR 연산 사용
            Long newCount = redisTemplate.opsForValue().increment(viewCountKey);
            log.info("Redis INCR 결과: newCount={}", newCount);
            
            // TTL 설정
            redisTemplate.expire(viewCountKey, VIEW_COUNT_EXPIRE);
            log.info("TTL 설정 완료: key={}, expireTime={}", viewCountKey, VIEW_COUNT_EXPIRE);
            
            if (newCount != null && newCount > 0) {
                log.info("게시글 {} 조회수 증가 성공: 현재조회수={}", postId, newCount);
                return true;
            }
            
            log.warn("게시글 {} 조회수 증가 실패: newCount={}", postId, newCount);
            return false;
            
        } catch (Exception e) {
            log.error("게시글 {} 조회수 증가 실패", postId, e);
            return false;
        }
    }
    
    /**
     * 게시글 조회수 조회
     */
    public long getViewCount(Long postId) {
        try {
            String viewCountKey = VIEW_COUNT_KEY + postId;
            String count = redisTemplate.opsForValue().get(viewCountKey);
            return count != null ? Long.parseLong(count) : 0L;
        } catch (Exception e) {
            log.error("게시글 {} 조회수 조회 실패", postId, e);
            return 0L;
        }
    }

    /**
     * Redis 연결 테스트
     */
    public void testRedisConnection() {
        try {
            log.info("Redis 연결 테스트 시작");
            String testKey = "test:connection";
            String testValue = "success";
            
            // Redis에 값 저장
            redisTemplate.opsForValue().set(testKey, testValue);
            log.info("Redis 값 저장 성공: key={}, value={}", testKey, testValue);
            
            // Redis에서 값 조회
            String retrievedValue = redisTemplate.opsForValue().get(testKey);
            log.info("Redis 값 조회 성공: key={}, value={}", testKey, retrievedValue);
            
            // Redis에서 값 삭제
            redisTemplate.delete(testKey);
            log.info("Redis 값 삭제 성공: key={}", testKey);
            
            log.info("Redis 연결 테스트 완료");
        } catch (Exception e) {
            log.error("Redis 연결 테스트 실패", e);
            throw e;
        }
    }
    
}
