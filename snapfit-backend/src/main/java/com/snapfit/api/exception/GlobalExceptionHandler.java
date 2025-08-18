package com.snapfit.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 전역 예외 처리기 (개발/스테이징 전용)
 * 운영 환경에서는 상세 메시지 노출 금지
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * JWT 관련 예외를 401로 매핑
     */
    @ExceptionHandler({ 
        io.jsonwebtoken.JwtException.class, 
        IllegalArgumentException.class,
        RuntimeException.class 
    })
    public ResponseEntity<Map<String, Object>> handleJwt(Exception e) {
        var body = new LinkedHashMap<String, Object>();
        body.put("code", "UNAUTHORIZED");
        body.put("message", e.getMessage());
        body.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handle(Exception e) {
        // 운영에선 상세 메시지/스택노출 금지
        var body = new LinkedHashMap<String, Object>();
        body.put("error", e.getClass().getSimpleName());
        body.put("message", getRootCauseMessage(e));
        body.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private String getRootCauseMessage(Exception e) {
        Throwable cause = e;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause.getMessage() != null ? cause.getMessage() : e.getMessage();
    }
}
