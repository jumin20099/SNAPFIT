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
        System.out.println("=== JWT 필터 요청 경로: " + requestPath + " ===");
        
        // 헤더에서 토큰 확인
        String header = request.getHeader("Authorization");
        System.out.println("Authorization 헤더: " + header);
        String token = null;
        
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            System.out.println("헤더에서 토큰 읽기 성공: " + token.substring(0, 20) + "...");
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
                        if ("token".equals(cookie.getName())) {
                            token = cookie.getValue();
                            System.out.println("쿠키에서 토큰 읽기 성공");
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
            System.out.println("=== JWT 필터 요청 경로: " + requestPath + " ===");
            
            // 개발 환경에서 JWT 검증 완전 우회
            System.out.println("=== 개발 환경 JWT 검증 완전 우회 ===");
            
            // JWT 토큰에서 실제 사용자 정보 추출
            String subject = "qazplm20099@gmail.com"; // 기본값
            String role = "ADMIN"; // 기본값
            
            try {
                // JWT 토큰 디코딩 (페이로드 부분만)
                System.out.println("=== JWT 토큰 파싱 시작 ===");
                System.out.println("원본 토큰: " + token.substring(0, 50) + "...");
                
                String[] parts = token.split("\\.");
                System.out.println("토큰 파트 수: " + parts.length);
                
                if (parts.length == 3) {
                    String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
                    System.out.println("디코딩된 페이로드: " + payload);
                    
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(payload);
                    
                    subject = jsonNode.get("sub").asText();
                    role = jsonNode.get("role").asText();
                    
                    System.out.println("=== JWT 토큰에서 추출된 정보 ===");
                    System.out.println("사용자: " + subject);
                    System.out.println("역할: " + role);
                } else {
                    System.out.println("토큰 형식이 올바르지 않음: " + parts.length + " 파트");
                }
            } catch (Exception e) {
                System.out.println("=== JWT 토큰 파싱 실패, 기본값 사용: " + e.getMessage() + " ===");
                e.printStackTrace();
            }
            
            System.out.println("최종 사용자: " + subject);
            System.out.println("최종 권한: " + role);

            // User 엔티티 조회 또는 생성
            final String finalSubject = subject;
            final String finalRole = role;
            
            // temp@example.com 사용자 확인 및 기존 계정 사용
            User user = null;
            if ("temp@example.com".equals(subject)) {
                System.out.println("=== temp@example.com 사용자 조회 시작 ===");
                java.util.List<User> tempUsers = userRepository.findAll().stream()
                    .filter(u -> "temp@example.com".equals(u.getEmail()))
                    .collect(java.util.stream.Collectors.toList());
                System.out.println("temp@example.com 계정 수: " + tempUsers.size());
                tempUsers.forEach(u -> System.out.println("  - userIdx: " + u.getUserIdx() + ", nickname: " + u.getNickname()));
                
                // 기존 계정이 있으면 첫 번째 계정 사용 (새로 생성하지 않음)
                if (!tempUsers.isEmpty()) {
                    user = tempUsers.get(0);
                    System.out.println("=== 기존 temp@example.com 계정 사용 ===");
                    System.out.println("userIdx: " + user.getUserIdx());
                    System.out.println("email: " + user.getEmail());
                    System.out.println("nickname: " + user.getNickname());
                }
            }
            
            // user가 null이면 새로 생성
            if (user == null) {
                user = userRepository.findByEmail(subject)
                    .orElseGet(() -> {
                        System.out.println("=== 새로운 사용자 생성: " + finalSubject + " ===");
                        User newUser = User.builder()
                            .email(finalSubject)
                            .nickname(finalSubject.equals("temp@example.com") ? "임시사용자" : "TestUser")
                            .role(User.Role.valueOf(finalRole))
                            .provider("local")
                            .providerId("test_local_id")
                            .build();
                        User savedUser = userRepository.save(newUser);
                        System.out.println("생성된 사용자 ID: " + savedUser.getUserIdx());
                        return savedUser;
                    });
            }
            
            System.out.println("=== 최종 사용자 정보 ===");
            System.out.println("userIdx: " + user.getUserIdx());
            System.out.println("email: " + user.getEmail());
            System.out.println("nickname: " + user.getNickname());

            // CustomUserDetails 생성 (컨트롤러에서 @AuthenticationPrincipal로 사용)
            CustomUserDetails customUserDetails = new CustomUserDetails(user);
            
            // SecurityContext에 설정
            UsernamePasswordAuthenticationToken auth = 
                new UsernamePasswordAuthenticationToken(
                    customUserDetails,  // CustomUserDetails 사용
                    null,
                    customUserDetails.getAuthorities()
                );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
            
            System.out.println("=== JWT 인증 성공 (우회): 사용자=" + subject + ", 역할=" + role + " ===");

        } catch (Exception e) {
            System.out.println("=== JWT 처리 중 오류 발생: " + e.getMessage() + " ===");
            e.printStackTrace();
        }
        filterChain.doFilter(request, response);
    }
}
