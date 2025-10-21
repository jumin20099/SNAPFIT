package com.snapfit.api.security;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import java.util.List;
import java.time.Duration;

import com.snapfit.api.service.CustomOAuth2UserService;
import com.snapfit.api.security.JwtAuthenticationFilter;
import com.snapfit.api.security.CsrfFilter;
import com.snapfit.api.security.JwtUtil;
import com.snapfit.api.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final UserRepository userRepository;
    private final CsrfFilter csrfFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ObjectProvider<ClientRegistrationRepository> clients // 빈이 없으면 null 반환
    ) throws Exception {
        boolean hasOauth = clients.getIfAvailable() != null;
        log.info("OAuth2 설정 상태: hasOauth={}", hasOauth);

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/csrf/**", "/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/api/products/**", "/api/posts/**", "/api/brands/**").permitAll()
                .requestMatchers("/api/notifications", "/api/notifications/**", "/api/reactions/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/partner/**").hasAnyRole("ADMIN", "PARTNER")
                .anyRequest().permitAll() // 임시로 모든 요청을 허용
            )
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // OAuth2가 설정되어 있을 때만 oauth2Login 활성화
        // 개발 환경에서는 강제로 활성화
        if (hasOauth || true) { // 개발용 강제 활성화
            http.oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(auth -> auth
                    .baseUri("/oauth2/authorization"))
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/login/oauth2/code/*"))
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService))
                .successHandler((request, response, authentication) -> {
                    try {
                        log.info("=== OAuth2 로그인 성공 핸들러 실행 ===");
                        log.info("요청 URL: {}", request.getRequestURL());
                        log.info("요청 쿼리: {}", request.getQueryString());
                        log.info("인증 정보: {}", authentication);
                        
                        // OAuth2 로그인 성공 후 프론트엔드로 리다이렉트
                        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                        log.info("OAuth2User: {}", oauth2User);
                        log.info("OAuth2User Attributes: {}", oauth2User.getAttributes());
                        
                        String token = (String) oauth2User.getAttributes().get("token");
                        String userIdx = oauth2User.getAttributes().get("userIdx").toString();
                        String email = (String) oauth2User.getAttributes().get("email");
                        
                        log.info("OAuth2 사용자 정보: token={}, userIdx={}, email={}", 
                                token != null ? "있음" : "없음", userIdx, email);
                        
                        if (token != null && email != null) {
                            boolean secureCookie = isSecureRequest(request);
                            String sameSite = secureCookie ? "Strict" : "Lax";

                            ResponseCookie accessCookie = ResponseCookie.from("token", token)
                                .httpOnly(true)
                                .secure(secureCookie)
                                .sameSite(sameSite)
                                .path("/")
                                .maxAge(Duration.ofDays(1))
                                .build();
                            response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
                            log.info("✅ JWT 토큰 쿠키 설정 완료 (secure={}, sameSite={})", secureCookie, sameSite);
                            
                            // 리프레시 토큰 생성 및 쿠키 설정 (보안 강화)
                            String refreshToken = jwtUtil.generateRefreshToken(email);
                            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                                .httpOnly(true)
                                .secure(secureCookie)
                                .sameSite(sameSite)
                                .path("/")
                                .maxAge(Duration.ofDays(7))
                                .build();
                            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
                            log.info("✅ 리프레시 토큰 쿠키 설정 완료 (secure={}, sameSite={})", secureCookie, sameSite);
                            
                            // 보안: 토큰을 쿼리 스트링에 노출하지 않음
                            String redirectUrl = "http://localhost:3000?login=success";
                            log.info("리다이렉트 URL: {}", redirectUrl);
                            response.sendRedirect(redirectUrl);
                        } else {
                            log.warn("토큰 또는 이메일이 없음 - 기본 성공 페이지로 리다이렉트");
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

        // JWT 필터 활성화
        http.addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userRepository),
                UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    new AntPathRequestMatcher("/api/**")
                )
            );
        
        // CSRF 필터 추가
        http.addFilterBefore(csrfFilter, UsernamePasswordAuthenticationFilter.class);
        

        return http.build();
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        if (request == null) {
            return true;
        }
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        if (forwardedProto != null && "https".equalsIgnoreCase(forwardedProto)) {
            return true;
        }
        return request.isSecure();
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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
