package com.snapfit.api.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<?> kakaoLogin(@RequestParam String code) {
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

        // Access Token을 HTTP-only 쿠키로 설정
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
            .httpOnly(true)
            .secure(false) // 개발환경에서는 false, 프로덕션에서는 true
            .sameSite("Lax")
            .path("/")
            .maxAge(30 * 60) // 30분
            .build();

        // Refresh Token을 HTTP-only 쿠키로 설정
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(false) // 개발환경에서는 false, 프로덕션에서는 true
            .sameSite("Lax")
            .path("/")
            .maxAge(7 * 24 * 60 * 60) // 7일
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
            .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
            .body(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken, // localStorage에도 저장할 수 있도록 응답에 포함
                "email",    email,
                "nickname", nickname
            ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.ok().body(Map.of("message", "로그인이 필요합니다."));
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        
        // Access Token을 HTTP-only 쿠키로 설정
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
            .httpOnly(true)
            .secure(false) // 개발환경에서는 false, 프로덕션에서는 true
            .sameSite("Lax")
            .path("/")
            .maxAge(30 * 60) // 30분
            .build();

        // Refresh Token을 HTTP-only 쿠키로 설정
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(false) // 개발환경에서는 false, 프로덕션에서는 true
            .sameSite("Lax")
            .path("/")
            .maxAge(7 * 24 * 60 * 60) // 7일
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
            .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
            .body(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken, // localStorage에도 저장할 수 있도록 응답에 포함
                "email", user.getEmail(),
                "nickname", user.getNickname()
            ));
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout() {
        // Access Token 쿠키 제거
        ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
            .httpOnly(true)
            .secure(false)
            .sameSite("Lax")
            .path("/")
            .maxAge(0)
            .build();

        // Refresh Token 쿠키 제거
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
            .httpOnly(true)
            .secure(false)
            .sameSite("Lax")
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
            @RequestBody(required = false) Map<String, String> request,
            @CookieValue(value = "refresh_token", required = false) String refreshTokenFromCookie) {
        try {
            // 요청 본문에서 리프레시 토큰을 먼저 시도하고, 없으면 쿠키에서 가져오기
            String refreshToken = null;
            if (request != null && request.get("refreshToken") != null) {
                refreshToken = request.get("refreshToken");
            } else if (refreshTokenFromCookie != null) {
                refreshToken = refreshTokenFromCookie;
            }
            
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
            
            // 새로운 Access Token을 HTTP-only 쿠키로 설정
            ResponseCookie accessCookie = ResponseCookie.from("access_token", newAccessToken)
                .httpOnly(true)
                .secure(false) // 개발환경에서는 false, 프로덕션에서는 true
                .sameSite("Lax")
                .path("/")
                .maxAge(30 * 60) // 30분
                .build();

            return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(Map.of(
                    "accessToken", newAccessToken,
                    "email", email,
                    "nickname", user.getNickname()
                ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "토큰 갱신 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/test-token")
    public ResponseEntity<?> generateTestToken() {
        // 테스트용 이메일과 역할로 토큰 생성
        String testEmail = "test@example.com";
        String testRole = "USER";
        
        String accessToken = jwtUtil.generateAccessToken(testEmail, testRole);
        String refreshToken = jwtUtil.generateRefreshToken(testEmail);
        
        return ResponseEntity.ok().body(Map.of(
            "accessToken", accessToken,
            "refreshToken", refreshToken,
            "email", testEmail,
            "role", testRole,
            "message", "테스트용 토큰이 생성되었습니다."
        ));
    }
}
