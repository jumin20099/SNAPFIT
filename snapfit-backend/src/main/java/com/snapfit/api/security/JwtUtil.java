// src/main/java/com/snapfit/api/security/JwtUtil.java
package com.snapfit.api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import java.security.Key;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${jwt.access-token.expiration-ms:1800000}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-token.expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @PostConstruct
    public void validateJwtSecret() {
        // 보안: JWT 시크릿 키 검증 및 생성
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            // 개발 환경에서는 자동으로 강한 키 생성
            if (isDevelopmentEnvironment()) {
                jwtSecret = generateSecureSecret();
                System.out.println("⚠️  개발 환경에서 자동으로 JWT 시크릿 키를 생성했습니다.");
                System.out.println("⚠️  프로덕션 환경에서는 반드시 JWT_SECRET 환경 변수를 설정하세요.");
            } else {
                throw new IllegalStateException(
                    "JWT_SECRET 환경 변수가 설정되지 않았습니다. " +
                    "프로덕션 환경에서는 반드시 강한 JWT 시크릿 키를 설정해야 합니다. " +
                    "예: export JWT_SECRET=$(openssl rand -base64 64)"
                );
            }
        }
        
        // 최소 길이 검증 (HS256 최소 권장: 32바이트)
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException(
                "JWT 시크릿 키가 너무 짧습니다. " +
                "최소 32자 이상의 강한 키를 사용해야 합니다. " +
                "현재 길이: " + jwtSecret.length() + "자"
            );
        }
        
        // 개발용 기본 키 사용 금지
        if (jwtSecret.equals("defaultSecretKeyForDevelopmentOnly") || 
            jwtSecret.contains("development") || 
            jwtSecret.contains("test")) {
            throw new IllegalStateException(
                "개발용 기본 JWT 시크릿 키 사용이 감지되었습니다. " +
                "프로덕션 환경에서는 반드시 강한 랜덤 키를 사용해야 합니다."
            );
        }
        
        System.out.println("✅ JWT 시크릿 키 검증 완료 (길이: " + jwtSecret.length() + "자)");
    }
    
    private boolean isDevelopmentEnvironment() {
        String profile = System.getProperty("spring.profiles.active", "");
        return "dev".equals(profile) || "development".equals(profile) || profile.isEmpty();
    }
    
    private String generateSecureSecret() {
        // 64바이트(512비트) 강한 랜덤 키 생성
        SecureRandom random = new SecureRandom();
        byte[] keyBytes = new byte[64];
        random.nextBytes(keyBytes);
        return Base64.getEncoder().encodeToString(keyBytes);
    }

    // 서명 키 생성 (HS256용)
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Access Token 생성 (짧은 만료시간)
     * @param subject 이메일 또는 userIdx
     * @param role 권한
     */
    public String generateAccessToken(String subject, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpirationMs);

        return Jwts.builder()
                .setSubject(subject)
                .claim("role", role)
                .claim("type", "access")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Refresh Token 생성 (긴 만료시간)
     * @param subject 이메일 또는 userIdx
     */
    public String generateRefreshToken(String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpirationMs);

        return Jwts.builder()
                .setSubject(subject)
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 토큰 타입 확인
     */
    public String getTokenType(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("type", String.class);
        } catch (JwtException ex) {
            return null;
        }
    }

    /**
     * 기존 generateToken(subject)도 role=USER로 기본값 지정 (하위 호환성)
     */
    public String generateToken(String subject) {
        return generateAccessToken(subject, "USER");
    }

    /**
     * 기존 generateToken(subject, role)도 하위 호환성 유지
     */
    public String generateToken(String subject, String role) {
        return generateAccessToken(subject, role);
    }

    /**
     * 토큰에서 Subject(=이메일)을 추출
     */
    public String getSubjectFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * 토큰에서 Role 추출
     */
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", String.class);
    }

    /**
     * 토큰 유효성 검증 (서명, 만료 등)
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException ex) {
            // Malformed, Expired, SignatureException 등 세부 예외를 잡아도 됨
            return false;
        }
    }

    /**
     * Access Token 유효성 검증
     */
    public boolean validateAccessToken(String token) {
        if (!validateToken(token)) {
            return false;
        }
        String tokenType = getTokenType(token);
        return "access".equals(tokenType);
    }

    /**
     * Refresh Token 유효성 검증
     */
    public boolean validateRefreshToken(String token) {
        if (!validateToken(token)) {
            return false;
        }
        String tokenType = getTokenType(token);
        return "refresh".equals(tokenType);
    }
}
