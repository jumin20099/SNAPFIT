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
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

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
                        
                        // 사용자 정보 조회 (새로 생성하지 않음)
                        User user = userService.findByEmail(subject);
                        if (user != null) {
                            userId = user.getUserIdx().toString();
                            log.info("JWT 토큰에서 사용자 ID 추출: {}", userId);
                        } else {
                            log.warn("사용자를 찾을 수 없음: {}", subject);
                        }
                    } catch (Exception e) {
                        log.error("JWT 토큰 검증 실패: {}", e.getMessage());
                        throw new RuntimeException("JWT 토큰 검증 실패");
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
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "token", required = false) String queryToken,
            @RequestParam(value = "userIdx", required = false) String userIdxParam,
            HttpServletRequest request) {
        
        String userId = null;
        
        // 1. Authorization 헤더에서 JWT 토큰 우선 확인
        if (userId == null) {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                try {
                    String subject = jwtUtil.getSubjectFromToken(token);
                    User user = userService.findByEmail(subject);
                    if (user != null) {
                        userId = user.getUserIdx().toString();
                        log.info("Authorization 헤더에서 사용자 ID 추출: {}", userId);
                    }
                } catch (Exception e) {
                    log.error("Authorization 헤더 JWT 토큰 검증 실패: {}", e.getMessage());
                }
            }
        }
        
        // 2. userIdx 파라미터 확인
        if (userId == null && userIdxParam != null && !userIdxParam.trim().isEmpty()) {
            userId = userIdxParam;
            log.info("userIdx 파라미터에서 사용자 ID 추출: {}", userId);
        }
        
        // 3. @AuthenticationPrincipal에서 사용자 정보 확인
        if (userId == null && userDetails != null) {
            userId = userDetails.getUsername();
            log.info("@AuthenticationPrincipal에서 사용자 ID 추출: {}", userId);
        }
        
        // 4. queryToken이 있으면 JWT 검증 (기존 로직 유지 for SSE)
        if (userId == null && queryToken != null) {
            try {
                String subject = jwtUtil.getSubjectFromToken(queryToken);
                User user = userService.findByEmail(subject);
                if (user != null) {
                    userId = user.getUserIdx().toString();
                    log.info("queryToken에서 사용자 ID 추출: {}", userId);
                }
            } catch (Exception e) {
                log.error("queryToken 검증 실패: {}", e.getMessage());
            }
        }
        
        if (userId == null) {
            log.error("사용자 ID를 추출할 수 없음");
            throw new RuntimeException("사용자 ID를 추출할 수 없음");
        }
        
        final String finalUserId = userId;
        
        log.info("=== SSE 연결 시작 ===");
        log.info("연결 요청 사용자 ID: {}", finalUserId);
        log.info("현재 연결된 SSE 에미터 수: {}", sseEmitters.size());
        log.info("연결된 사용자 ID들: {}", sseEmitters.keySet());
        
        // 기존 연결이 있으면 제거
        UUID userUuid = UUID.fromString(finalUserId);
        SseEmitter existingEmitter = sseEmitters.remove(userUuid);
        if (existingEmitter != null) {
            log.info("기존 SSE 연결 제거: {}", finalUserId);
            existingEmitter.complete();
        }
        
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        sseEmitters.put(userUuid, emitter);
        
        log.info("새로운 SSE 연결 생성 완료: {}", finalUserId);
        log.info("업데이트된 연결된 SSE 에미터 수: {}", sseEmitters.size());
        log.info("업데이트된 연결된 사용자 ID들: {}", sseEmitters.keySet());
        
        // 연결 유지를 위한 하트비트 설정
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleAtFixedRate(() -> {
            try {
                if (sseEmitters.containsKey(userUuid)) {
                    emitter.send(SseEmitter.event()
                        .name("heartbeat")
                        .data("ping"));
                    log.debug("하트비트 전송: {}", finalUserId);
                } else {
                    scheduler.shutdown();
                }
            } catch (Exception e) {
                log.debug("하트비트 전송 실패: {}", e.getMessage());
                scheduler.shutdown();
            }
        }, 30, 30, TimeUnit.SECONDS);
        
        emitter.onCompletion(() -> {
            log.info("SSE 연결 완료: {}", finalUserId);
            sseEmitters.remove(userUuid);
            scheduler.shutdown();
            log.info("SSE 에미터 제거됨 (완료): {}, 현재 에미터 수: {}", finalUserId, sseEmitters.size());
        });
        
        emitter.onTimeout(() -> {
            log.info("SSE 연결 타임아웃: {}", finalUserId);
            sseEmitters.remove(userUuid);
            scheduler.shutdown();
            log.info("SSE 에미터 제거됨 (타임아웃): {}, 현재 에미터 수: {}", finalUserId, sseEmitters.size());
        });
        
        emitter.onError((ex) -> {
            log.error("SSE 연결 오류: 사용자={}, 오류={}", finalUserId, ex.getMessage());
            sseEmitters.remove(userUuid);
            scheduler.shutdown();
            log.info("SSE 에미터 제거됨 (오류): {}, 현재 에미터 수: {}", finalUserId, sseEmitters.size());
        });
        
        // 연결 확인 메시지 전송
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("SSE 연결 성공: " + finalUserId));
            log.info("연결 확인 메시지 전송 완료: {}", finalUserId);
        } catch (Exception e) {
            log.error("연결 확인 메시지 전송 실패: {}", e.getMessage());
        }
        
        return emitter;
    }

    /**
     * 특정 사용자에게 알림 전송 (SSE)
     */
    public void sendNotificationToUser(String userId, NotificationResponseDto notification) {
        System.out.println("=== SSE 알림 전송 시작 ===");
        System.out.println("사용자 ID: " + userId);
        System.out.println("알림 내용: " + notification.getMessage());
        
        // SSE 에미터 상태 확인 로그 추가
        System.out.println("=== SSE 에미터 상태 확인 ===");
        System.out.println("현재 연결된 SSE 에미터 수: " + sseEmitters.size());
        System.out.println("연결된 사용자 ID들: " + sseEmitters.keySet());
        System.out.println("찾으려는 사용자 ID: " + userId);
        
        UUID userUuid = UUID.fromString(userId);
        SseEmitter emitter = sseEmitters.get(userUuid);
        if (emitter != null) {
            try {
                System.out.println("SSE 에미터 발견, 알림 전송 중...");
                emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(notification));
                System.out.println("SSE를 통해 사용자 " + userId + "에게 알림 전송 성공: " + notification.getId());
            } catch (Exception e) {
                System.err.println("SSE 알림 전송 실패: 사용자=" + userId + ", 오류=" + e.getMessage());
                e.printStackTrace();
                // 전송 실패 시 연결 제거
                sseEmitters.remove(userUuid);
                System.out.println("전송 실패로 인한 SSE 에미터 제거: " + userId);
            }
        } else {
            System.out.println("사용자 " + userId + "에 대한 SSE 에미터를 찾을 수 없음");
            System.out.println("현재 연결된 SSE 에미터 수: " + sseEmitters.size());
            System.out.println("연결된 사용자 ID들: " + sseEmitters.keySet());
        }
    }

    /**
     * 특정 사용자에게 읽지 않은 알림 개수 전송 (SSE)
     */
    public void sendUnreadCountToUser(String userId, int count) {
        System.out.println("=== SSE 알림 개수 업데이트 시작 ===");
        System.out.println("사용자 ID: " + userId);
        System.out.println("읽지 않은 알림 개수: " + count);
        
        UUID userUuid = UUID.fromString(userId);
        SseEmitter emitter = sseEmitters.get(userUuid);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name("notification_count")
                    .data(count));
                System.out.println("SSE를 통해 사용자 " + userId + "에게 알림 개수 업데이트 성공: " + count);
            } catch (Exception e) {
                System.err.println("SSE 알림 개수 업데이트 실패: 사용자=" + userId + ", 오류=" + e.getMessage());
                e.printStackTrace();
                // 전송 실패 시 연결 제거
                sseEmitters.remove(userUuid);
            }
        } else {
            System.out.println("사용자 " + userId + "에 대한 SSE 에미터를 찾을 수 없음");
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

