package com.snapfit.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * CSRF 토큰 검증 필터
 * POST, PUT, DELETE, PATCH 요청에 대해 CSRF 토큰을 검증합니다.
 */
@Component
public class CsrfFilter extends OncePerRequestFilter {
    
    @Autowired
    private CsrfTokenService csrfTokenService;
    
    // CSRF 검증을 건너뛸 경로들
    private static final List<String> SKIP_PATHS = Arrays.asList(
        "/api/csrf/",
        "/api/auth/",
        "/login/oauth2/",
        "/oauth2/",
        "/error",
        "/sse/"
    );
    
    // CSRF 검증이 필요한 HTTP 메서드들
    private static final List<String> PROTECTED_METHODS = Arrays.asList(
        "POST", "PUT", "DELETE", "PATCH"
    );
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        
        // 건너뛸 경로 확인
        if (shouldSkipPath(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // 보호된 메서드인지 확인
        if (!PROTECTED_METHODS.contains(method)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // CSRF 토큰 검증
        String csrfToken = request.getHeader("X-CSRF-TOKEN");
        if (csrfToken == null || csrfToken.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"CSRF 토큰이 필요합니다\"}");
            return;
        }
        
        if (!csrfTokenService.validateToken(csrfToken)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"유효하지 않은 CSRF 토큰입니다\"}");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private boolean shouldSkipPath(String path) {
        return SKIP_PATHS.stream().anyMatch(path::startsWith);
    }
}
