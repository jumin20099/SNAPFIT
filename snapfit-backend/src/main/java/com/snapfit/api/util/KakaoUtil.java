package com.snapfit.api.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.snapfit.api.dto.KakaoDTO;

@Component
@ConditionalOnProperty(name = "spring.security.oauth2.client.registration.kakao.client-id")
public class KakaoUtil {

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.kakao.client-secret}")
    private String clientSecret;
    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public KakaoDTO.OAuthToken requestToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String,String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String,String>> req = new HttpEntity<>(params, headers);
        ResponseEntity<String> resp = restTemplate.exchange(
            "https://kauth.kakao.com/oauth/token",
            HttpMethod.POST, req, String.class
        );

        try {
            return objectMapper.readValue(resp.getBody(), KakaoDTO.OAuthToken.class);
        } catch (Exception e) {
            throw new RuntimeException("토큰 파싱 실패", e);
        }
    }

    public KakaoDTO.KakaoProfile requestProfile(KakaoDTO.OAuthToken token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token.getAccess_token());
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<Void> req = new HttpEntity<>(headers);
        ResponseEntity<String> resp = restTemplate.exchange(
            "https://kapi.kakao.com/v2/user/me",
            HttpMethod.GET, req, String.class
        );

        try {
            return objectMapper.readValue(resp.getBody(), KakaoDTO.KakaoProfile.class);
        } catch (Exception e) {
            throw new RuntimeException("프로필 파싱 실패", e);
        }
    }
}
