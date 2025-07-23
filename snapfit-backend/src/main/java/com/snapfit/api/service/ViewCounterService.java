package com.snapfit.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;
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
     * 현재 조회수 반환 (없으면 0).
     */
    public long getCount(String key) {
        Long val = redisTemplate.opsForValue().get(key);
        return val != null ? val : 0L;
    }
} 