package com.snapfit.api.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
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

        String token = jwtUtil.generateToken(email, user.getRole().name());

        // HTTP-only 쿠키 설정
        ResponseCookie cookie = ResponseCookie.from("auth_token", token)
            .httpOnly(true)
            .secure(false) // 개발환경에서는 false, 프로덕션에서는 true
            .sameSite("Lax")
            .path("/")
            .maxAge(24 * 60 * 60) // 24시간
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of(
                "token",    token,
                "email",    email,
                "nickname", nickname
            ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.ok().body(Map.of("message", "로그인이 필요합니다."));
        }

        String token = jwtUtil.generateToken(user.getEmail());
        
        // HTTP-only 쿠키 설정
        ResponseCookie cookie = ResponseCookie.from("auth_token", token)
            .httpOnly(true)
            .secure(false) // 개발환경에서는 false, 프로덕션에서는 true
            .sameSite("Lax")
            .path("/")
            .maxAge(24 * 60 * 60) // 24시간
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of(
                "token", token,
                "email", user.getEmail(),
                "nickname", user.getNickname()
            ));
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout() {
        // 쿠키 제거 (만료 시간을 0으로 설정)
        ResponseCookie cookie = ResponseCookie.from("auth_token", "")
            .httpOnly(true)
            .secure(false) // 개발환경에서는 false, 프로덕션에서는 true
            .sameSite("Lax")
            .path("/")
            .maxAge(0)
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of("message", "로그아웃되었습니다."));
    }
}
