package com.snapfit.api.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CustomOAuth2UserService
        implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {
        try {
            // 1) DefaultOAuth2UserService 로 프로필 로드
            OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate =
                    new DefaultOAuth2UserService();
            OAuth2User oauthUser = delegate.loadUser(userRequest);

            // 2) kakao 공급자만 처리
            String registrationId = userRequest.getClientRegistration().getRegistrationId();
            if (!"kakao".equals(registrationId)) {
                throw new OAuth2AuthenticationException("지원하지 않는 OAuth2 공급자: " + registrationId);
            }

            // 3) 속성에서 id, email, nickname 추출
            Map<String, Object> attrs = oauthUser.getAttributes();
            Long kakaoId = ((Number) attrs.get("id")).longValue();

            @SuppressWarnings("unchecked")
            Map<String, Object> account = (Map<String, Object>) attrs.get("kakao_account");
            String rawEmail = account != null ? (String) account.get("email") : null;
            @SuppressWarnings("unchecked")
            Map<String, Object> profile = account != null
                    ? (Map<String, Object>) account.get("profile")
                    : null;
            String rawNickname = profile != null ? (String) profile.get("nickname") : null;

            // 4) final 변수에 넣어서 람다 캡처 가능하게
            final String email = (rawEmail == null || rawEmail.isBlank())
                    ? "kakao_" + kakaoId + "@kakao.anon"
                    : rawEmail;
            final String nickname = rawNickname != null
                    ? rawNickname
                    : "카카오사용자";


            // 5) DB 조회·생성
            Optional<User> opt = userRepo.findByProviderAndProviderId("kakao", kakaoId.toString());
            User user;
            
            if (opt.isPresent()) {
                user = opt.get();
                // 기존 사용자의 경우 이메일만 업데이트 (닉네임은 유지)
                user.setEmail(email);
            } else {
                user = User.builder()
                        .email(email)
                        .nickname(nickname)
                        .provider("kakao")
                        .providerId(kakaoId.toString())
                        .role(User.Role.USER)
                        .build();
            }

            // 6) 사용자 저장 (기존 사용자는 닉네임 유지, 새 사용자는 닉네임 설정)
            user = userRepo.save(user);

            // 저장 후 freshUser로 다시 조회해서 role 값 확인
            User freshUser = userRepo.findByEmail(email).orElse(null);
            if (freshUser != null) {
            } else {
            }

            // 7) JWT 토큰 생성
            String token = jwtUtil.generateToken(email, user.getRole().name());

            // 8) DefaultOAuth2User 리턴 (ROLE_USER)
            return new DefaultOAuth2User(
                    List.of(new SimpleGrantedAuthority("ROLE_USER")),
                    Map.of(
                        "id", kakaoId,
                        "email", email,
                        "nickname", nickname,
                        "token", token,
                        "userIdx", user.getUserIdx()
                    ),
                    "id"
            );
        } catch (Exception e) {
            throw new OAuth2AuthenticationException("카카오 로그인 처리 실패");
        }
    }
}
