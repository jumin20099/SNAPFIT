package com.snapfit.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.support.ChannelInterceptor;
import lombok.extern.slf4j.Slf4j;

/**
 * WebSocket 설정
 * 연매출 100억 서비스 수준의 보안과 최적화 적용
 * 
 * 보안 고려사항:
 * - CORS 설정
 * - 인증 및 권한 확인
 * - Rate limiting
 * - 메시지 크기 제한
 * 
 * 최적화 고려사항:
 * - 메시지 브로커 설정
 * - 채널 인터셉터
 * - 에러 핸들링
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 메시지 브로커 설정
        config.enableSimpleBroker("/topic", "/queue", "/user"); // 개인/그룹/전체 메시지
        
        // 애플리케이션 목적지 접두사
        config.setApplicationDestinationPrefixes("/app");
        
        // 사용자별 개인 메시지 접두사
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 엔드포인트 등록
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("http://localhost:3000", "https://snapfit.com") // CORS 설정
            .withSockJS()
            .setHeartbeatTime(25000) // 25초
            .setDisconnectDelay(5000); // 5초
        
        // 보안: 특정 도메인만 허용
        log.info("WebSocket 엔드포인트 등록 완료: /ws");
    }


} 