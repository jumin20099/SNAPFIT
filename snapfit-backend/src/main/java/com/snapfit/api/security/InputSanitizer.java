package com.snapfit.api.security;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/**
 * 사용자 입력 데이터 sanitizing 유틸리티
 * XSS, HTML 태그, 제어문자 등을 필터링합니다.
 */
@Component
public class InputSanitizer {
    
    // HTML 태그 패턴
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    
    // 스크립트 태그 패턴
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)<script[^>]*>.*?</script>");
    
    // 이벤트 핸들러 패턴 (onclick, onload 등)
    private static final Pattern EVENT_HANDLER_PATTERN = Pattern.compile("(?i)\\s*on\\w+\\s*=");
    
    // JavaScript URL 패턴
    private static final Pattern JAVASCRIPT_URL_PATTERN = Pattern.compile("(?i)javascript:");
    
    // 제어문자 패턴 (탭, 개행 제외)
    private static final Pattern CONTROL_CHAR_PATTERN = Pattern.compile("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]");
    
    /**
     * 일반 텍스트 sanitizing
     */
    public String sanitizeText(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        String sanitized = input.trim();
        
        // HTML 태그 제거
        sanitized = HTML_TAG_PATTERN.matcher(sanitized).replaceAll("");
        
        // 스크립트 태그 제거
        sanitized = SCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        
        // 이벤트 핸들러 제거
        sanitized = EVENT_HANDLER_PATTERN.matcher(sanitized).replaceAll("");
        
        // JavaScript URL 제거
        sanitized = JAVASCRIPT_URL_PATTERN.matcher(sanitized).replaceAll("");
        
        // 제어문자 제거 (탭, 개행 제외)
        sanitized = CONTROL_CHAR_PATTERN.matcher(sanitized).replaceAll("");
        
        return sanitized;
    }
    
    /**
     * 댓글 내용 sanitizing
     */
    public String sanitizeComment(String comment) {
        if (!StringUtils.hasText(comment)) {
            return comment;
        }
        
        String sanitized = sanitizeText(comment);
        
        // 길이 제한 (1000자)
        if (sanitized.length() > 1000) {
            sanitized = sanitized.substring(0, 1000);
        }
        
        return sanitized;
    }
    
    /**
     * 신고 사유 sanitizing
     */
    public String sanitizeReportReason(String reason) {
        if (!StringUtils.hasText(reason)) {
            return reason;
        }
        
        String sanitized = sanitizeText(reason);
        
        // 길이 제한 (500자)
        if (sanitized.length() > 500) {
            sanitized = sanitized.substring(0, 500);
        }
        
        return sanitized;
    }
    
    /**
     * 닉네임 sanitizing
     */
    public String sanitizeNickname(String nickname) {
        if (!StringUtils.hasText(nickname)) {
            return nickname;
        }
        
        String sanitized = sanitizeText(nickname);
        
        // 길이 제한 (20자)
        if (sanitized.length() > 20) {
            sanitized = sanitized.substring(0, 20);
        }
        
        // 특수문자 제한 (한글, 영문, 숫자, 일부 특수문자만 허용)
        sanitized = sanitized.replaceAll("[^가-힣a-zA-Z0-9._-]", "");
        
        return sanitized;
    }
    
    /**
     * 입력값이 안전한지 검증
     */
    public boolean isSafeInput(String input) {
        if (!StringUtils.hasText(input)) {
            return true;
        }
        
        // 위험한 패턴이 있는지 확인
        return !HTML_TAG_PATTERN.matcher(input).find() &&
               !SCRIPT_PATTERN.matcher(input).find() &&
               !EVENT_HANDLER_PATTERN.matcher(input).find() &&
               !JAVASCRIPT_URL_PATTERN.matcher(input).find();
    }
}
