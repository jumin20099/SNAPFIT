// src/main/java/com/snapfit/api/dto/UserDto.java
package com.snapfit.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

public class UserDto {

    @Getter
    @Setter
    public static class RegisterRequest {
        @NotBlank(message = "이메일을 입력하세요.")
        @Email(message = "유효한 이메일 주소를 입력하세요.")
        private String email;

        @NotBlank(message = "비밀번호를 입력하세요.")
        @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하여야 합니다.")
        private String password;

        @NotBlank(message = "닉네임을 입력하세요.")
        @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하여야 합니다.")
        private String nickname;
    }

    @Getter
    @Setter
    public static class VerifyEmailRequest {
        @NotBlank(message = "이메일을 입력하세요.")
        @Email(message = "유효한 이메일 주소를 입력하세요.")
        private String email;

        @NotBlank(message = "인증번호를 입력하세요.")
        @Pattern(regexp = "\\d{6}", message = "인증번호는 숫자 6자리여야 합니다.")
        private String verificationCode;
    }

    @Getter
    @Setter
    public static class LoginRequest {
        @NotBlank(message = "이메일을 입력하세요.")
        @Email(message = "유효한 이메일 주소를 입력하세요.")
        private String email;

        @NotBlank(message = "비밀번호를 입력하세요.")
        private String password;
    }

    @Getter
    @Setter
    public static class LoginResponse {
        private String token;
        public LoginResponse(String token) {
            this.token = token;
        }
    }
}
