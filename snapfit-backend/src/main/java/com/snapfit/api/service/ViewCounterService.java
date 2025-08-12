package com.snapfit.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;
import java.time.Duration;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.util.Collections;

/**
 * 실시간 조회수 카운터 서비스 (Redis Lua 기반).
 */
@Service
public class ViewCounterService {

    private final RedisTemplate<String, Long> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private RedisScript<Long> incrScript;
    private RedisScript<Long> seenScript;

    // TTL 60초 (필요에 따라 변경)
    private static final long TTL_SECONDS = 60L;

    @Autowired
    public ViewCounterService(RedisTemplate<String, Long> redisTemplate, SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    private void loadScript() {
        try {
            ClassPathResource scriptResource = new ClassPathResource("redis/incr_with_ttl.lua");
            String scriptText = new String(scriptResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            this.incrScript = new DefaultRedisScript<>(scriptText, Long.class);
            ClassPathResource seenResource = new ClassPathResource("redis/view_incr_if_new.lua");
            String seenText = new String(seenResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            this.seenScript = new DefaultRedisScript<>(seenText, Long.class);
        } catch (Exception e) {
            throw new IllegalStateException("Lua 스크립트를 로드할 수 없습니다", e);
        }
    }

    /**
     * 조회수 1 증가 후 현재 카운트 반환.
     * @param key Redis 키 (예: "product:123:views")
     */
    public long increment(String key) {
        Long result = redisTemplate.execute(incrScript, Collections.singletonList(key), TTL_SECONDS);
        long count = result != null ? result : 0L;
        // WebSocket 브로드캐스트
        messagingTemplate.convertAndSend("/topic/views/" + key, new com.snapfit.api.dto.ViewCountPayload(key, count));
        return count;
    }

    /**
     * 주어진 userKey가 오늘 날짜의 seen set에 없으면 추가하고 1을 반환. 있으면 0 반환.
     * @param seenKey 예: view:seen:{productId}:{yyyyMMdd}
     * @param userKey 예: u:{uuid} 또는 a:{anonId}
     * @param ttlSeconds set의 TTL
     */
    public long addSeenIfNew(String seenKey, String userKey, long ttlSeconds) {
        Long result = redisTemplate.execute(seenScript, Collections.singletonList(seenKey), userKey, String.valueOf(ttlSeconds));
        return result != null ? result : 0L;
    }

    /**
     * 24시간 등 롤링 윈도우 중복 방지: 특정 키가 없으면 생성하고 TTL 부여.
     * 키는 "view:seen24:{productId}:{userKey}" 형태 권장.
     */
    public long addSeenRollingIfNew(String key, long ttlSeconds) {
        Boolean ok = redisTemplate.opsForValue().setIfAbsent(key, 1L, Duration.ofSeconds(ttlSeconds));
        return Boolean.TRUE.equals(ok) ? 1L : 0L;
    }

    /**
     * 현재 조회수 반환 (없으면 0).
     */
    public long getCount(String key) {
        Long val = redisTemplate.opsForValue().get(key);
        return val != null ? val : 0L;
    }
} 