package com.snapfit.api.controller;

import com.snapfit.api.dto.notification.NotificationResponseDto;
import com.snapfit.api.service.NotificationService;
import com.snapfit.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.entity.User;
import com.snapfit.api.service.UserService;

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
    private final UserService userService;
    
    // SSE 연결을 위한 사용자별 Emitter 저장
    private final ConcurrentHashMap<UUID, SseEmitter> sseEmitters = new ConcurrentHashMap<>();

    /**
     * 사용자의 알림 목록을 가져옵니다
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        try {
            log.info("=== 알림 목록 조회 요청 시작 ===");
            log.info("userDetails: {}", userDetails);
            
            String userId = null;
            
            // 1. @AuthenticationPrincipal에서 사용자 정보 확인
            if (userDetails != null) {
                if (userDetails instanceof CustomUserDetails) {
                    CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
                    userId = customUserDetails.getUserId();
                    log.info("CustomUserDetails에서 사용자 ID 추출: {}", userId);
                } else {
                    // fallback: username을 UUID로 변환 시도
                    userId = userDetails.getUsername();
                    log.info("일반 UserDetails에서 사용자 ID 추출: {}", userId);
                }
            }
            
            // 2. @AuthenticationPrincipal이 null이면 JWT 토큰에서 직접 추출
            if (userId == null) {
                String header = request.getHeader("Authorization");
                if (header != null && header.startsWith("Bearer ")) {
                    String token = header.substring(7);
                    try {
                        String subject = jwtUtil.getSubjectFromToken(token);
                        String role = jwtUtil.getRoleFromToken(token);
                        
                        // 사용자 정보 조회
                        User user = userService.findByEmail(subject);
                        if (user != null) {
                            userId = user.getUserIdx().toString();
                            log.info("JWT 토큰에서 사용자 ID 추출: {}", userId);
                        }
                    } catch (Exception e) {
                        log.error("JWT 토큰 검증 실패: {}", e.getMessage());
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                    }
                }
            }
            
            if (userId == null) {
                log.error("사용자 ID를 추출할 수 없습니다");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            UUID userUuid = UUID.fromString(userId);
            List<NotificationResponseDto> notifications = notificationService.getUserNotifications(userUuid);
            log.info("알림 목록 조회 성공: {}개", notifications.size());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("알림 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * SSE를 통한 실시간 알림 스트리밍
     */
    @GetMapping("/stream")
    public SseEmitter streamNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "token", required = false) String queryToken,
            HttpServletRequest request) {
        
        log.info("=== SSE 연결 요청 시작 ===");
        log.info("userDetails: {}", userDetails);
        log.info("queryToken: {}", queryToken != null ? queryToken.substring(0, 20) + "..." : "null");
        
        String userId = null;
        
        // 1. @AuthenticationPrincipal에서 사용자 정보 확인
        if (userDetails != null) {
            if (userDetails instanceof CustomUserDetails) {
                CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
                userId = customUserDetails.getUserId();
                log.info("CustomUserDetails에서 사용자 ID 추출: {}", userId);
            } else {
                // fallback: username을 UUID로 변환 시도
                userId = userDetails.getUsername();
                log.info("일반 UserDetails에서 사용자 ID 추출: {}", userId);
            }
        }
        
        // 2. @AuthenticationPrincipal이 null이면 JWT 토큰에서 직접 추출
        if (userId == null) {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                try {
                    String subject = jwtUtil.getSubjectFromToken(token);
                    String role = jwtUtil.getRoleFromToken(token);
                    
                    // 사용자 정보 조회
                    User user = userService.findByEmail(subject);
                    if (user != null) {
                        userId = user.getUserIdx().toString();
                        log.info("JWT 토큰에서 사용자 ID 추출: {}", userId);
                    }
                } catch (Exception e) {
                    log.error("JWT 토큰 검증 실패: {}", e.getMessage());
                    return new SseEmitter(0L);
                }
            }
        }
        
        // 3. queryToken이 있으면 JWT 검증 (기존 로직 유지)
        if (userId == null && queryToken != null) {
            try {
                String subject = jwtUtil.getSubjectFromToken(queryToken);
                String role = jwtUtil.getRoleFromToken(queryToken);
                
                // 사용자 정보 조회
                User user = userService.findByEmail(subject);
                if (user != null) {
                    userId = user.getUserIdx().toString();
                    log.info("queryToken에서 사용자 ID 추출: {}", userId);
                }
            } catch (Exception e) {
                log.error("queryToken JWT 검증 실패: {}", e.getMessage());
                return new SseEmitter(0L);
            }
        }
        
        if (userId == null) {
            log.error("사용자 ID를 추출할 수 없습니다");
            return new SseEmitter(0L);
        }
        
        final String finalUserId = userId;
        
        try {
            UUID userUuid = UUID.fromString(finalUserId);
            SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
            
            // 사용자별 SSE 에미터 저장
            sseEmitters.put(userUuid, emitter);
            
            // 연결 성공 이벤트 전송
            emitter.send(SseEmitter.event()
                .name("connect")
                .data("SSE 연결이 설정되었습니다"));
            
            // 읽지 않은 알림 개수 전송
            long unreadCount = notificationService.getUnreadNotificationCount(userUuid);
            emitter.send(SseEmitter.event()
                .name("unread_count")
                .data(unreadCount));
            
            // 연결 해제 시 정리
            emitter.onCompletion(() -> {
                log.info("SSE 연결 완료: 사용자={}", finalUserId);
                sseEmitters.remove(userUuid);
            });
            
            emitter.onTimeout(() -> {
                log.info("SSE 연결 타임아웃: 사용자={}", finalUserId);
                sseEmitters.remove(userUuid);
            });
            
            emitter.onError((ex) -> {
                log.error("SSE 연결 오류: 사용자={}, 오류={}", finalUserId, ex.getMessage());
                sseEmitters.remove(userUuid);
            });
            
            log.info("SSE 연결 생성 완료: 사용자={}", finalUserId);
            return emitter;
            
        } catch (Exception e) {
            log.error("SSE 연결 생성 실패: 사용자={}, 오류={}", finalUserId, e.getMessage(), e);
            return new SseEmitter(0L);
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

    /**
     * 테스트용 좋아요 알림 생성 (개발 환경에서만 사용)
     */
    @PostMapping("/test/like")
    public ResponseEntity<String> createTestLikeNotification(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long postId,
            @RequestParam String message) {
        
        try {
            if (userDetails instanceof CustomUserDetails) {
                CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
                String userId = customUserDetails.getUserId();
                UUID userUuid = UUID.fromString(userId);
                
                // 테스트 알림 생성
                notificationService.createNotification(
                    userUuid,
                    "LIKE",
                    userUuid, // 자신에게 알림
                    postId,
                    "LIKE_POST",
                    message
                );
                
                log.info("테스트 좋아요 알림 생성 완료: 사용자={}, 게시글={}", userId, postId);
                return ResponseEntity.ok("테스트 알림이 생성되었습니다");
            } else {
                return ResponseEntity.badRequest().body("사용자 정보를 찾을 수 없습니다");
            }
        } catch (Exception e) {
            log.error("테스트 알림 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("테스트 알림 생성에 실패했습니다");
        }
    }
}
