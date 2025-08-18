package com.snapfit.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * SSE(Server-Sent Events) 설정
 * WebSocket 대신 HTTP 기반의 실시간 통신 사용
 */
@Slf4j
@Configuration
public class WebSocketConfig {

    // WebSocket 관련 설정 제거
    // SSE는 별도 설정 없이 Spring Boot에서 자동 지원
    
    public WebSocketConfig() {
        log.info("SSE 기반 알림 시스템 설정 완료");
        log.info("WebSocket 대신 Server-Sent Events를 사용합니다");
    }
} 