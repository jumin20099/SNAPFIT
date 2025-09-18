package com.snapfit.api.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Redis에 누적된 조회수를 주기적으로 DB에 반영하는 배치 스케줄러.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnBean(StringRedisTemplate.class)
public class ViewCountFlushScheduler {

    private final JdbcTemplate jdbcTemplate;
    
    // StringRedisTemplate을 조건부로 주입
    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Scheduled(fixedRate = 60_000)
    public void flushViewCounts() {
        if (redisTemplate == null) {
            return; // Redis가 없으면 스케줄링 생략
        }
        
        // live 키는 누적 반영 대상이 아님 (실시간 세션 용도)
        Set<String> keys = redisTemplate.keys("product:*:views");
        if (keys == null || keys.isEmpty()) return;

        for (String key : keys) {
            String countStr = redisTemplate.opsForValue().get(key);
            if (countStr == null || countStr.isEmpty()) continue;
            
            Long count = Long.parseLong(countStr);
            if (count == 0) continue;

            try {
                Long productId = Long.parseLong(key.split(":")[1]);
                int updated = jdbcTemplate.update(
                        "UPDATE products SET view_count = COALESCE(view_count, 0) + ? WHERE product_idx = ?",
                        count, productId);
                if (updated > 0) {
                    redisTemplate.delete(key);
                }
            } catch (Exception e) {
                log.error("View count flush 실패: key={}", key, e);
            }
        }
    }
} 