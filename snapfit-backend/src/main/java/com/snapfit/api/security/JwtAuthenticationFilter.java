// src/main/java/com/snapfit/api/security/JwtAuthenticationFilter.java
package com.snapfit.api.security;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomOAuth2User;
import com.snapfit.api.security.CustomUserDetails;

/**
 * 모든 요청마다 헤더의 Authorization: Bearer <token> 을 체크하여
 * JWT가 유효한 경우 SecurityContext에 인증 정보를 설정
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    /**
     * OAuth2 콜백이나 에러 페이지 등에서는 JWT 필터를 건너뛰도록.
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        // OAuth2 로그인 콜백, 에러 처리, swagger 등 필요시 여기에 추가
        return path.startsWith("/login/oauth2/")
            || path.startsWith("/oauth2/")
            || path.startsWith("/error")
            || path.startsWith("/sse/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        
        // 쿠키에서 access_token 확인 (우선순위)
        String token = null;
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        
        // 쿠키에 토큰이 없으면 Authorization 헤더에서 확인 (하위 호환성)
        if (token == null) {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ") && header.length() > 7) {
                token = header.substring(7);
                if (token == null || token.trim().isEmpty() || "null".equals(token)) {
                    token = null;
                }
            }
        }
        
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }
        
        
        try {
            // JWT 토큰 유효성 검증
            if (!jwtUtil.validateToken(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // JWT 토큰에서 사용자 정보 추출
            String email = jwtUtil.getSubjectFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            if (email == null || role == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // User 엔티티 조회
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // CustomUserDetails 생성
            CustomUserDetails customUserDetails = new CustomUserDetails(user);
            
            // SecurityContext에 설정
            UsernamePasswordAuthenticationToken auth = 
                new UsernamePasswordAuthenticationToken(
                    customUserDetails,
                    null,
                    customUserDetails.getAuthorities()
                );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            // 인증 실패 시 계속 진행 (인증되지 않은 상태로 처리)
        }
        filterChain.doFilter(request, response);
    }
}
