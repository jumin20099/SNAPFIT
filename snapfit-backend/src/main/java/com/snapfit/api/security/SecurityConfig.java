package com.snapfit.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.snapfit.api.service.CustomOAuth2UserService;
import com.snapfit.api.security.JwtAuthenticationFilter;
import com.snapfit.api.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",
                    "/oauth2/**",
                    "/login/oauth2/**",
                    "/api/health",
                    "/api/email/verify/**",
                    "/api/email/resend",
                    "/api/auth/signup",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/check-email",
                    "/api/auth/check-nickname",
                    "/api/auth/verify-email/**",
                    "/api/auth/resend-verification",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/auth/change-password",
                    "/api/auth/me",
                    "/api/auth/login/kakao"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(auth -> auth
                    .baseUri("/oauth2/authorization"))
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/login/oauth2/code/*"))
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService))
                .successHandler((request, response, authentication) -> {
                    // OAuth2 로그인 성공 후 프론트엔드로 리다이렉트
                    OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                    String token = (String) oauth2User.getAttributes().get("token");
                    
                    // 쿠키에 토큰 저장
                    jakarta.servlet.http.Cookie tokenCookie = new jakarta.servlet.http.Cookie("auth_token", token);
                    tokenCookie.setPath("/");
                    tokenCookie.setHttpOnly(false); // JavaScript에서 접근 가능하도록
                    tokenCookie.setSecure(false); // 개발 환경에서는 false
                    tokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
                    response.addCookie(tokenCookie);
                    
                    response.sendRedirect("http://localhost:3000");
                })
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtUtil),
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** CORS 전역 설정 */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
