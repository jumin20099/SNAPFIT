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
import org.springframework.http.HttpStatus;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpMethod;
import java.util.List;

import com.snapfit.api.service.CustomOAuth2UserService;
import com.snapfit.api.security.JwtAuthenticationFilter;
import com.snapfit.api.security.JwtUtil;
import com.snapfit.api.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final UserRepository userRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/", "/css/**", "/js/**",
                    "/login", "/login/oauth2/**", "/oauth2/**",
                    "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**",
                    "/api/auth/**", "/api/partner/**", "/api/admin/**", "/api/products/**", "/error",
                    "/ws/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
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
            .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userRepository),
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
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Set-Cookie", "Authorization"));
        config.setMaxAge(3600L); // 1시간

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
