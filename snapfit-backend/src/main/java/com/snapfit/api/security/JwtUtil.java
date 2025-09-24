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

    @Value("${jwt.expiration-ms:2592000000}")
    private long jwtExpirationMs;

    // 서명 키 생성 (HS256용)
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * JWT 토큰 생성 (role 포함)
     * @param subject 이메일 또는 userIdx
     * @param role 권한
     */
    public String generateToken(String subject, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(subject)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 기존 generateToken(subject)도 role=USER로 기본값 지정
     */
    public String generateToken(String subject) {
        return generateToken(subject, "USER");
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
}
