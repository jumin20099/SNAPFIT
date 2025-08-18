package com.snapfit.api.controller;

import com.snapfit.api.dto.notification.NotificationResponseDto;
import com.snapfit.api.service.NotificationService;
import com.snapfit.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 알림 컨트롤러
 * SSE를 통한 실시간 알림 처리
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;
    
    // SSE 연결을 위한 사용자별 Emitter 저장
    private final ConcurrentHashMap<String, SseEmitter> sseEmitters = new ConcurrentHashMap<>();

    /**
     * 사용자의 알림 목록을 가져옵니다
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            List<NotificationResponseDto> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("알림 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * SSE를 통한 실시간 알림 스트림
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(value = "token", required = false) String tokenParam) {
        try {
            String token = null;
            
            // Authorization 헤더에서 토큰 추출
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
            }
            
            // 헤더에 토큰이 없으면 쿼리 파라미터에서 추출
            if (token == null && tokenParam != null) {
                token = tokenParam;
            }
            
            // 토큰이 없으면 오류 반환
            if (token == null) {
                log.error("SSE 연결 시도: 토큰이 없음");
                throw new RuntimeException("인증 토큰이 필요합니다");
            }
            
            // JWT 토큰 검증 및 사용자 ID 추출
            String userId = validateTokenAndExtractUserId(token);
            
            String userKey = userId;
            
            // 기존 연결이 있다면 제거
            SseEmitter existingEmitter = sseEmitters.get(userKey);
            if (existingEmitter != null) {
                existingEmitter.complete();
                sseEmitters.remove(userKey);
            }
            
            // 새로운 SSE Emitter 생성
            SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
            sseEmitters.put(userKey, emitter);
            
            // 연결 완료 이벤트 전송
            emitter.send(SseEmitter.event()
                .name("connect")
                .data("SSE 연결이 설정되었습니다"));
            
            // 연결 해제 시 정리
            emitter.onCompletion(() -> {
                log.info("SSE 연결 완료: 사용자={}", userKey);
                sseEmitters.remove(userKey);
            });
            
            emitter.onTimeout(() -> {
                log.info("SSE 연결 타임아웃: 사용자={}", userKey);
                sseEmitters.remove(userKey);
            });
            
            emitter.onError((ex) -> {
                log.error("SSE 연결 오류: 사용자={}, 오류={}", userKey, ex.getMessage());
                sseEmitters.remove(userKey);
            });
            
            log.info("SSE 연결 생성: 사용자={}", userKey);
            return emitter;
            
        } catch (Exception e) {
            log.error("SSE 연결 생성 실패: {}", e.getMessage(), e);
            throw new RuntimeException("SSE 연결을 생성할 수 없습니다", e);
        }
    }

    /**
     * JWT 토큰 검증 및 사용자 ID 추출
     */
    private String validateTokenAndExtractUserId(String token) {
        try {
            log.info("JWT 토큰 검증 시작: 토큰 길이={}", token != null ? token.length() : 0);
            
            // JWT 토큰 검증
            if (!jwtUtil.validateToken(token)) {
                log.error("JWT 토큰 검증 실패: 토큰이 유효하지 않음");
                throw new RuntimeException("유효하지 않은 토큰입니다");
            }
            
            log.info("JWT 토큰 검증 성공");
            
            // JWT에서 사용자 ID 추출 (Subject에서 추출)
            String userId = jwtUtil.getSubjectFromToken(token);
            if (userId == null || userId.isEmpty()) {
                log.error("JWT에서 사용자 ID 추출 실패: userId={}", userId);
                throw new RuntimeException("토큰에서 사용자 ID를 추출할 수 없습니다");
            }
            
            log.info("JWT에서 사용자 ID 추출 성공: userId={}", userId);
            return userId;
        } catch (Exception e) {
            log.error("JWT 토큰 검증 실패: {}", e.getMessage(), e);
            throw new RuntimeException("토큰 검증에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 특정 사용자에게 알림 전송 (SSE)
     */
    public void sendNotificationToUser(String userId, NotificationResponseDto notification) {
        SseEmitter emitter = sseEmitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(notification));
                log.info("SSE를 통해 사용자 {}에게 알림 전송: {}", userId, notification.getId());
            } catch (Exception e) {
                log.error("SSE 알림 전송 실패: 사용자={}, 오류={}", userId, e.getMessage());
                // 전송 실패 시 연결 제거
                sseEmitters.remove(userId);
            }
        }
    }

    /**
     * 특정 사용자에게 읽지 않은 알림 개수 전송 (SSE)
     */
    public void sendUnreadCountToUser(String userId, int count) {
        SseEmitter emitter = sseEmitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name("unread_count")
                    .data(count));
                log.debug("SSE를 통해 사용자 {}에게 읽지 않은 알림 개수 전송: {}", userId, count);
            } catch (Exception e) {
                log.error("SSE 알림 개수 전송 실패: 사용자={}, 오류={}", userId, e.getMessage());
                sseEmitters.remove(userId);
            }
        }
    }

    /**
     * 특정 알림을 읽음 처리합니다
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            notificationService.markAsRead(notificationId, userId);
            
            // SSE를 통해 실시간 알림 개수 업데이트
            int unreadCount = notificationService.getUnreadCount(userId).intValue();
            sendUnreadCountToUser(userId.toString(), unreadCount);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("알림 읽음 처리 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 모든 알림을 읽음 처리합니다
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            notificationService.markAllAsRead(userId);
            
            // SSE를 통해 실시간 알림 개수 업데이트
            sendUnreadCountToUser(userId.toString(), 0);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("모든 알림 읽음 처리 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 알림을 삭제합니다
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            notificationService.deleteNotification(notificationId, userId);
            
            // SSE를 통해 실시간 알림 개수 업데이트
            int unreadCount = notificationService.getUnreadCount(userId).intValue();
            sendUnreadCountToUser(userId.toString(), unreadCount);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("알림 삭제 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 모든 알림을 삭제합니다
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteAllNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            notificationService.deleteAllNotifications(userId);
            
            // SSE를 통해 실시간 알림 개수 업데이트
            sendUnreadCountToUser(userId.toString(), 0);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("모든 알림 삭제 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 읽지 않은 알림 개수를 가져옵니다
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            Long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("읽지 않은 알림 개수 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 테스트용 알림 생성 (개발 환경에서만 사용)
     */
    @PostMapping("/test")
    public ResponseEntity<Void> createTestNotification(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            notificationService.createTestNotification(userId);
            
            // SSE를 통해 실시간 알림 전송
            NotificationResponseDto testNotification = notificationService.getUserNotifications(userId).get(0);
            sendNotificationToUser(userId.toString(), testNotification);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("테스트 알림 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
