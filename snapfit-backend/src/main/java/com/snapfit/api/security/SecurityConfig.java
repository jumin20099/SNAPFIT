package com.snapfit.api.security;

import org.springframework.beans.factory.ObjectProvider;
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
import org.springframework.http.HttpStatus;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import java.util.List;

import com.snapfit.api.service.CustomOAuth2UserService;
import com.snapfit.api.security.JwtAuthenticationFilter;
import com.snapfit.api.security.JwtUtil;
import com.snapfit.api.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.Cookie;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final UserRepository userRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ObjectProvider<ClientRegistrationRepository> clients // 빈이 없으면 null 반환
    ) throws Exception {
        boolean hasOauth = clients.getIfAvailable() != null;

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/", "/css/**", "/js/**",
                    "/login", "/login/oauth2/**", "/oauth2/**",
                    "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**",
                    "/api/auth/**", "/api/partner/**", "/api/admin/**", "/api/products/**", 
                    "/api/posts/**", "/api/comments/**", "/api/follows/**", "/api/search/**", 
                    "/api/ranking/**", "/api/health/**", "/api/notifications/stream", "/error",
                    "/ws/**", "/sse/**"
                ).permitAll()
                .requestMatchers("/api/**").authenticated() // 모든 비즈니스 API 인증 필수
                .anyRequest().authenticated()
            )
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // OAuth2가 설정되어 있을 때만 oauth2Login 활성화
        if (hasOauth) {
            http.oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(auth -> auth
                    .baseUri("/oauth2/authorization"))
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/login/oauth2/code/*"))
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService))
                .successHandler((request, response, authentication) -> {
                    try {
                        // OAuth2 로그인 성공 후 프론트엔드로 리다이렉트
                        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                        String token = (String) oauth2User.getAttributes().get("token");
                        String userIdx = oauth2User.getAttributes().get("userIdx").toString();
                        
                        if (token != null) {
                            // JWT 토큰을 쿠키에 설정
                            Cookie jwtCookie = new Cookie("token", token);
                            jwtCookie.setHttpOnly(true);
                            jwtCookie.setSecure(false); // 개발환경에서는 false
                            jwtCookie.setPath("/");
                            jwtCookie.setMaxAge(86400); // 24시간
                            response.addCookie(jwtCookie);
                            
                            // URL 파라미터로 토큰과 사용자 정보 전달
                            String redirectUrl = "http://localhost:3000?token=" + token + "&userIdx=" + userIdx + "&login=success";
                            response.sendRedirect(redirectUrl);
                        } else {
                            // 토큰이 없는 경우 기본 성공 페이지로
                            response.sendRedirect("http://localhost:3000?login=success");
                        }
                    } catch (Exception e) {
                        log.error("OAuth2 로그인 성공 처리 실패", e);
                        // 오류 발생 시 기본 성공 페이지로
                        response.sendRedirect("http://localhost:3000?login=success");
                    }
                })
                .failureHandler((request, response, exception) -> {
                    log.error("OAuth2 로그인 실패", exception);
                    // OAuth2 로그인 실패 시 프론트엔드로 리다이렉트
                    String errorMessage = exception.getMessage();
                    String redirectUrl = "http://localhost:3000?login=error&error=" + errorMessage;
                    response.sendRedirect(redirectUrl);
                })
            );
        }

        http.addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userRepository),
                UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    new AntPathRequestMatcher("/api/**")
                )
            );

        return http.build();
    }

    /** CORS 전역 설정 */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Last-Event-ID", "*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Set-Cookie", "Authorization", "Content-Type"));
        config.setMaxAge(3600L); // 1시간

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
