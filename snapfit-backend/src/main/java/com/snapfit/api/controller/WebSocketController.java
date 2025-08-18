package com.snapfit.api.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * SSE(Server-Sent Events) 상태 확인 컨트롤러
 * WebSocket 관련 코드 제거하고 SSE 상태만 확인
 */
@Slf4j
@RestController
public class WebSocketController {

    /**
     * SSE 서버 상태 확인
     */
    @GetMapping("/api/notifications/sse/status")
    @ResponseBody
    public Map<String, Object> getSSEStatus() {
        return Map.of(
            "status", "SSE 서버 정상",
            "timestamp", System.currentTimeMillis(),
            "protocol", "Server-Sent Events",
            "endpoints", Map.of(
                "notifications", "/api/notifications/stream"
            ),
            "description", "HTTP 기반 실시간 알림 시스템",
            "note", "SSE 스트림은 NotificationController에서 처리됩니다"
        );
    }

    /**
     * SSE 연결 테스트용 엔드포인트
     */
    @GetMapping("/sse/test")
    @ResponseBody
    public Map<String, String> testSSE() {
        return Map.of("status", "SSE 서버가 정상적으로 실행 중입니다");
    }
}
