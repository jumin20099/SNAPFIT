// src/main/java/com/snapfit/api/security/JwtAuthenticationFilter.java
package com.snapfit.api.security;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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
        // OAuth2 로그인 콜백, 에러 처리, swagger, SSE 등 필요시 여기에 추가
        return path.startsWith("/login/oauth2/")
            || path.startsWith("/oauth2/")
            || path.startsWith("/error")
            || path.startsWith("/api/notifications/stream")
            || path.startsWith("/sse/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        System.out.println("=== JWT 필터 요청 경로: " + requestPath + " ===");
        
        // 헤더에서 토큰 확인
        String header = request.getHeader("Authorization");
        String token = null;
        
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            System.out.println("헤더에서 토큰 읽기 성공");
        } else {
            // 헤더에 토큰이 없으면 쿼리 파라미터에서 확인 (WebSocket 연결용)
            String queryToken = request.getParameter("token");
            if (queryToken != null && !queryToken.trim().isEmpty()) {
                token = queryToken.trim();
                System.out.println("쿼리 파라미터에서 토큰 읽기 성공");
            } else {
                // 쿼리 파라미터에도 토큰이 없으면 쿠키에서 확인
                jakarta.servlet.http.Cookie[] cookies = request.getCookies();
                System.out.println("쿠키 배열: " + (cookies != null ? cookies.length : "null"));
                if (cookies != null) {
                    for (jakarta.servlet.http.Cookie cookie : cookies) {
                        System.out.println("쿠키 이름: " + cookie.getName() + ", 값: " + cookie.getValue().substring(0, Math.min(20, cookie.getValue().length())) + "...");
                        if ("auth_token".equals(cookie.getName())) {
                            token = cookie.getValue();
                            System.out.println("쿠키에서 토큰 읽기 성공: " + token.substring(0, Math.min(20, token.length())) + "...");
                            break;
                        }
                    }
                }
                if (token == null) {
                    System.out.println("쿠키에서 토큰을 찾을 수 없음");
                }
            }
        }
        
        if (token == null) {
            System.out.println("=== 토큰 없음, 인증 없이 진행 ===");
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            if (jwtUtil.validateToken(token)) {
    
                String subject = jwtUtil.getSubjectFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);

                
                // User 엔티티 조회
                User user = userRepository.findByEmail(subject)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + subject));

                
                // CustomOAuth2User 생성
                CustomOAuth2User customOAuth2User = new CustomOAuth2User(user, Map.of());

                
                // SecurityContext에 설정
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(
                        customOAuth2User,
                        null,
                        customOAuth2User.getAuthorities()
                    );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);

            } else {

            }
        } catch (Exception e) {

            e.printStackTrace();
        }
        filterChain.doFilter(request, response);
    }
}
