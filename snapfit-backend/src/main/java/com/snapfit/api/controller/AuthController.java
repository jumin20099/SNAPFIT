package com.snapfit.api.controller;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.JwtUtil;
import com.snapfit.api.util.KakaoUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    
    // KakaoUtil을 조건부로 주입
    @Autowired(required = false)
    private KakaoUtil kakaoUtil;

    @GetMapping("/login/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestParam String code, HttpServletRequest request) {
        if (kakaoUtil == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Kakao 로그인이 설정되지 않았습니다."));
        }
        
        var oauthToken = kakaoUtil.requestToken(code);
        var profile    = kakaoUtil.requestProfile(oauthToken);

        String email    = profile.getKakao_account().getEmail();
        String nickname = profile.getProperties().getNickname();

        User user = userRepo.findByEmail(email)
            .orElseGet(() -> User.builder()
                                 .email(email)
                                 .nickname(nickname)
                                 .provider("kakao")
                                 .providerId(profile.getId().toString())
                                 .build());
        userRepo.save(user);

        String accessToken = jwtUtil.generateAccessToken(email, user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(email);

        boolean secureCookie = shouldUseSecureCookies(request);
        String sameSite = secureCookie ? "Strict" : "Lax";

        // Access Token을 HTTP-only 쿠키로 설정 (환경에 따라 secure/sameSite 결정)
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(sameSite)
            .path("/")
            .maxAge(Duration.ofMinutes(30))
            .build();

        // Refresh Token을 HTTP-only 쿠키로 설정 (환경에 따라 secure/sameSite 결정)
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(sameSite)
            .path("/")
            .maxAge(Duration.ofDays(7))
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
            .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
            .body(Map.of(
                "message", "로그인 성공",
                "email", email,
                "nickname", nickname
            ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user, HttpServletRequest request) {
        if (user == null) {
            return ResponseEntity.ok().body(Map.of("message", "로그인이 필요합니다."));
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        
        boolean secureCookie = shouldUseSecureCookies(request);
        String sameSite = secureCookie ? "Strict" : "Lax";

        // Access Token을 HTTP-only 쿠키로 설정 (환경에 따라 secure/sameSite 결정)
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(sameSite)
            .path("/")
            .maxAge(Duration.ofMinutes(30))
            .build();

        // Refresh Token을 HTTP-only 쿠키로 설정 (환경에 따라 secure/sameSite 결정)
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(sameSite)
            .path("/")
            .maxAge(Duration.ofDays(7))
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
            .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
            .body(Map.of(
                "message", "로그인 성공",
                "email", user.getEmail(),
                "nickname", user.getNickname()
            ));
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        boolean secureCookie = shouldUseSecureCookies(request);
        String sameSite = secureCookie ? "Strict" : "Lax";

        // Access Token 쿠키 제거
        ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(sameSite)
            .path("/")
            .maxAge(0)
            .build();

        // Refresh Token 쿠키 제거
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite(sameSite)
            .path("/")
            .maxAge(0)
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
            .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
            .body(Map.of("message", "로그아웃되었습니다."));
    }

    /**
     * 토큰 갱신 엔드포인트
     */
    @GetMapping("/cookie-check")
    public ResponseEntity<?> checkCookies(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            @CookieValue(value = "token", required = false) String accessToken) {
        Map<String, Object> response = new HashMap<>();
        response.put("hasRefreshToken", refreshToken != null);
        response.put("hasAccessToken", accessToken != null);
        response.put("refreshTokenLength", refreshToken != null ? refreshToken.length() : 0);
        response.put("accessTokenLength", accessToken != null ? accessToken.length() : 0);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(value = "refresh_token", required = false) String refreshTokenFromCookie,
            HttpServletRequest request) {
        try {
            // 보안: 쿠키에서만 Refresh Token 가져오기 (JSON 본문에서 받지 않음)
            String refreshToken = refreshTokenFromCookie;
            
            if (refreshToken == null || refreshToken.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Refresh token이 필요합니다."));
            }

            // Refresh Token 유효성 검증
            if (!jwtUtil.validateRefreshToken(refreshToken)) {
                return ResponseEntity.status(401).body(Map.of("error", "유효하지 않은 refresh token입니다."));
            }

            // Refresh Token에서 사용자 정보 추출
            String email = jwtUtil.getSubjectFromToken(refreshToken);
            User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            // 새로운 Access Token 생성
            String newAccessToken = jwtUtil.generateAccessToken(email, user.getRole().name());
            
            // 새로운 Access Token을 HTTP-only 쿠키로 설정 (보안 강화)
            boolean secureCookie = shouldUseSecureCookies(request);
            String sameSite = secureCookie ? "Strict" : "Lax";

            ResponseCookie accessCookie = ResponseCookie.from("access_token", newAccessToken)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ofMinutes(30))
                .build();

            return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(Map.of(
                    "message", "토큰 갱신 성공",
                    "email", email,
                    "nickname", user.getNickname()
                ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "토큰 갱신 중 오류가 발생했습니다."));
        }
    }

    // 보안: 테스트 토큰 엔드포인트 제거됨
    // @GetMapping("/test-token") - 프로덕션에서 제거

    private boolean shouldUseSecureCookies(HttpServletRequest request) {
        if (request == null) {
            return true;
        }
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        if (forwardedProto != null && "https".equalsIgnoreCase(forwardedProto)) {
            return true;
        }
        return request.isSecure();
    }
}
