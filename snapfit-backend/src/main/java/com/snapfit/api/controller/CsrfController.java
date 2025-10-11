package com.snapfit.api.controller;

import com.snapfit.api.security.CsrfTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

/**
 * CSRF 토큰 관리 컨트롤러
 */
@RestController
@RequestMapping("/api/csrf")
@CrossOrigin(
    origins = {"http://localhost:3000", "https://snapfit.app", "https://www.snapfit.app"},
    allowCredentials = "true",
    allowedHeaders = {"Content-Type", "X-CSRF-TOKEN", "X-Requested-With"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class CsrfController {
    
    @Autowired
    private CsrfTokenService csrfTokenService;
    
    /**
     * CSRF 토큰 생성 및 반환
     */
    @GetMapping("/token")
    public ResponseEntity<?> getCsrfToken(HttpServletResponse response) {
        try {
            var csrfToken = csrfTokenService.generateToken();
            
            // CSRF 토큰을 쿠키로 설정 (Double Submit Cookie 패턴) - 보안 강화
            Cookie csrfCookie = new Cookie("XSRF-TOKEN", csrfToken.getToken());
            csrfCookie.setHttpOnly(false); // JavaScript에서 읽을 수 있도록
            csrfCookie.setSecure(true); // 프로덕션 환경에서 보안 강화
            csrfCookie.setPath("/");
            csrfCookie.setMaxAge(30 * 60); // 30분
            response.addCookie(csrfCookie);
            
            return ResponseEntity.ok(Map.of(
                "token", csrfToken.getToken(),
                "headerName", csrfToken.getHeaderName(),
                "parameterName", csrfToken.getParameterName()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "CSRF 토큰 생성 실패"));
        }
    }
    
    /**
     * CSRF 토큰 검증
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateCsrfToken(@RequestHeader("X-CSRF-TOKEN") String token) {
        try {
            boolean isValid = csrfTokenService.validateToken(token);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("valid", true));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("valid", false, "error", "유효하지 않은 CSRF 토큰"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "CSRF 토큰 검증 실패"));
        }
    }
}
