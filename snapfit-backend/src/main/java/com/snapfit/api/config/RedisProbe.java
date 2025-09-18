package com.snapfit.api.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisProbe implements ApplicationRunner {
    
    private final StringRedisTemplate redisTemplate;

    @Override
    public void run(org.springframework.boot.ApplicationArguments args) {
        try {
            log.info("=== Redis 연결 테스트 시작 ===");
            
            // Redis 연결 테스트
            redisTemplate.opsForValue().set("probe:test", "ok");
            String result = redisTemplate.opsForValue().get("probe:test");
            
            log.info("Redis 연결 테스트 결과: {}", result);
            
            if ("ok".equals(result)) {
                log.info("✅ Redis 연결 성공!");
            } else {
                log.error("❌ Redis 연결 실패!");
            }
            
        } catch (Exception e) {
            log.error("❌ Redis 연결 테스트 실패", e);
        }
    }
}
