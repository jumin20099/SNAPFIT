// src/main/java/com/snapfit/api/security/JwtUtil.java
package com.snapfit.api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret:defaultSecretKeyForDevelopmentOnly}")
    private String jwtSecret;

    @Value("${jwt.access-token.expiration-ms:1800000}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-token.expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

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
