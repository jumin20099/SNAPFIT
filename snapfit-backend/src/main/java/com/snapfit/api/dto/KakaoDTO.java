package com.snapfit.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;

public class KakaoDTO {

    @Getter
    public static class OAuthToken {
        @JsonProperty("access_token")  private String access_token;
        @JsonProperty("token_type")    private String token_type;
        @JsonProperty("refresh_token") private String refresh_token;
        @JsonProperty("expires_in")    private int expires_in;
        @JsonProperty("scope")         private String scope;
    }

    @Getter
    public static class KakaoProfile {
        private Long id;
        private KakaoAccount kakao_account;
        private Properties properties;

        @Getter
        public static class Properties {
            private String nickname;
        }

        @Getter
        public static class KakaoAccount {
            private String email;
            @JsonProperty("profile") private Profile profile;

            @Getter
            public static class Profile {
                private String nickname;
            }
        }
    }
}
