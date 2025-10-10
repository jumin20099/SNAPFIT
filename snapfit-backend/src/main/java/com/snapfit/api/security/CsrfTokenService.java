package com.snapfit.api.security;

import org.springframework.stereotype.Service;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.DefaultCsrfToken;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * CSRF 토큰 관리 서비스
 * Double Submit Cookie 패턴을 사용하여 CSRF 공격을 방어합니다.
 */
@Service
public class CsrfTokenService {
    
    private final ConcurrentHashMap<String, Long> tokenStore = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final SecureRandom secureRandom = new SecureRandom();
    
    public CsrfTokenService() {
        // 5분마다 만료된 토큰 정리
        scheduler.scheduleAtFixedRate(this::cleanupExpiredTokens, 5, 5, TimeUnit.MINUTES);
    }
    
    /**
     * 새로운 CSRF 토큰 생성
     */
    public CsrfToken generateToken() {
        String tokenValue = generateRandomToken();
        long expirationTime = System.currentTimeMillis() + (30 * 60 * 1000); // 30분 후 만료
        
        tokenStore.put(tokenValue, expirationTime);
        
        return new DefaultCsrfToken("X-CSRF-TOKEN", "_csrf", tokenValue);
    }
    
    /**
     * CSRF 토큰 검증
     */
    public boolean validateToken(String tokenValue) {
        if (tokenValue == null || tokenValue.trim().isEmpty()) {
            return false;
        }
        
        Long expirationTime = tokenStore.get(tokenValue);
        if (expirationTime == null) {
            return false;
        }
        
        // 토큰 만료 확인
        if (System.currentTimeMillis() > expirationTime) {
            tokenStore.remove(tokenValue);
            return false;
        }
        
        return true;
    }
    
    /**
     * CSRF 토큰 무효화
     */
    public void invalidateToken(String tokenValue) {
        tokenStore.remove(tokenValue);
    }
    
    /**
     * 랜덤 토큰 생성
     */
    private String generateRandomToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
    
    /**
     * 만료된 토큰 정리
     */
    private void cleanupExpiredTokens() {
        long currentTime = System.currentTimeMillis();
        tokenStore.entrySet().removeIf(entry -> entry.getValue() < currentTime);
    }
}
