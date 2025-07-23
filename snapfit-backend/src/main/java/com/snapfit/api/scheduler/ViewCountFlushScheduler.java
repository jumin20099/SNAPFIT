package com.snapfit.api.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
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
public class ViewCountFlushScheduler {

    private final RedisTemplate<String, Long> redisTemplate;
    private final JdbcTemplate jdbcTemplate;

    @Scheduled(fixedRate = 60_000)
    public void flushViewCounts() {
        Set<String> keys = redisTemplate.keys("product:*:views");
        if (keys == null || keys.isEmpty()) return;

        for (String key : keys) {
            Long count = redisTemplate.opsForValue().get(key);
            if (count == null || count == 0) continue;

            try {
                Long productId = Long.parseLong(key.split(":")[1]);
                int updated = jdbcTemplate.update(
                        "UPDATE products SET view_count = view_count + ? WHERE product_idx = ?",
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