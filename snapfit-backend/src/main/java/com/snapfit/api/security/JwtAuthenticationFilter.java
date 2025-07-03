// src/main/java/com/snapfit/api/security/JwtAuthenticationFilter.java
package com.snapfit.api.security;

import java.io.IOException;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 모든 요청마다 헤더의 Authorization: Bearer <token> 을 체크하여
 * JWT가 유효한 경우 SecurityContext에 인증 정보를 설정
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    /**
     * OAuth2 콜백이나 에러 페이지 등에서는 JWT 필터를 건너뛰도록.
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        // OAuth2 로그인 콜백, 에러 처리, swagger 등 필요시 여기에 추가
        return path.startsWith("/login/oauth2/")
            || path.startsWith("/oauth2/")
            || path.startsWith("/error");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            log.warn("Authorization 헤더 없음 또는 Bearer 누락");
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);
        try {
            if (jwtUtil.validateToken(token)) {
                String subject = jwtUtil.getSubjectFromToken(token);
                // 권한 정보만 USER로 고정 (필요 시 DB 조회하여 권한 추가)
                User principal = new User(subject, "", List.of());
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                    );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            log.error("JWT 인증 실패: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
