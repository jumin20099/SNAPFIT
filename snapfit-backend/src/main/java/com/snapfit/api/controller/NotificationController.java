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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.entity.User;
import com.snapfit.api.service.UserService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.Map;

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

    // Heartbeat(서버→클라 유지용) 전역 스케줄러가 emitters를 순회하며 15~25초마다 전송
    @Scheduled(fixedDelay = 20000)
    public void heartbeat() {
        sseEmitters.forEach((userId, em) -> {
            try {
                em.send(SseEmitter.event().name("heartbeat").data(System.currentTimeMillis()));
            } catch (IOException e) {
                em.complete();
                sseEmitters.remove(userId, em);
            }
        });
    }

    /**
     * 사용자의 알림 목록을 가져옵니다
     */
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<NotificationResponseDto>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        try {
            
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
                log.info("사용자 ID를 추출할 수 없습니다. 빈 알림 목록을 반환합니다.");
                return ResponseEntity.ok(List.of());
            }
            
            try {
                UUID userUuid = UUID.fromString(userId);
                List<NotificationResponseDto> notifications = notificationService.getUserNotifications(userUuid);
                log.info("알림 목록 조회 성공: {}개", notifications.size());
                return ResponseEntity.ok(notifications);
            } catch (IllegalArgumentException e) {
                log.warn("잘못된 사용자 ID 형식: {}. 빈 알림 목록을 반환합니다.", userId);
                return ResponseEntity.ok(List.of());
            }
        } catch (Exception e) {
            log.error("알림 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * SSE를 통한 실시간 알림 스트리밍
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal CustomUserDetails user, 
                           HttpServletRequest request, 
                           HttpServletResponse resp) throws IOException {
        // JWT 토큰에서 사용자 정보 추출 (Authentication Principal이 null인 경우 대비)
        String userId = null;
        if (user != null) {
            userId = user.getUserId();
            System.out.println("=== SSE 인증: @AuthenticationPrincipal 사용 ===");
            System.out.println("사용자 ID: " + userId);
        } else {
            System.out.println("=== SSE 인증: Authorization 헤더에서 직접 추출 ===");
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String email = jwtUtil.getSubjectFromToken(token);
                    System.out.println("토큰에서 추출한 이메일: " + email);
                    
                    User foundUser = userService.findByEmail(email);
                    if (foundUser == null) {
                        throw new RuntimeException("사용자를 찾을 수 없습니다: " + email);
                    }
                    userId = foundUser.getUserIdx().toString();
                    System.out.println("사용자 ID: " + userId);
                } catch (Exception e) {
                    System.err.println("토큰 검증 실패: " + e.getMessage());
                    throw new RuntimeException("인증 실패", e);
                }
            } else {
                throw new RuntimeException("Authorization 헤더가 없습니다");
            }
        }

        if (userId == null) {
            throw new RuntimeException("사용자 ID를 확인할 수 없습니다");
        }

        System.out.println("=== SSE 연결 시작 ===");
        System.out.println("사용자 ID: " + userId);

        // 중간계층 버퍼/압축 방지
        resp.setHeader("Cache-Control", "no-cache, no-transform");
        resp.setHeader("X-Accel-Buffering", "no");

        // 30분 유지 (환경에 맞게)
        final SseEmitter emitter = new SseEmitter(Duration.ofMinutes(30).toMillis());
        final String finalUserId = userId;

        // 동일 사용자 중복 연결 시 이전 연결 종료 (메모리/리소스 보호)
        UUID userUuid = UUID.fromString(userId);
        SseEmitter prev = sseEmitters.put(userUuid, emitter);
        if (prev != null) {
            System.out.println("기존 SSE 연결 종료: " + userId);
            prev.complete();
        }

        emitter.onCompletion(() -> {
            System.out.println("SSE 연결 완료: " + finalUserId);
            sseEmitters.remove(userUuid, emitter);
        });
        emitter.onTimeout(() -> {
            System.out.println("SSE 연결 타임아웃: " + finalUserId);
            emitter.complete();
            sseEmitters.remove(userUuid, emitter);
        });
        emitter.onError((ex) -> {
            System.err.println("SSE 연결 오류: " + finalUserId + ", 오류=" + ex.getMessage());
            emitter.complete();
            sseEmitters.remove(userUuid, emitter);
        });

        // 초기 이벤트 + 재연결 간격 제안(10s). Spring은 reconnectTime 지원.
        try {
            emitter.send(SseEmitter.event().name("open").data("ok").reconnectTime(10_000));
            System.out.println("SSE 초기 이벤트 전송 성공: " + userId);
        } catch (IOException e) {
            System.err.println("SSE 초기 이벤트 전송 실패: " + userId + ", 오류=" + e.getMessage());
            emitter.completeWithError(e);
        }

        System.out.println("=== SSE 연결 설정 완료 ===");
        System.out.println("현재 연결된 SSE 에미터 수: " + sseEmitters.size());
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
            System.out.println("=== SSE 연결 상태 상세 분석 ===");
            System.out.println("현재 연결된 모든 사용자:");
            sseEmitters.forEach((id, em) -> {
                System.out.println("  - " + id + " (활성: " + (em != null) + ")");
            });
            System.out.println("=== UUID 변환 확인 ===");
            try {
                UUID targetUuid = UUID.fromString(userId);
                System.out.println("대상 사용자 UUID 변환 성공: " + targetUuid);
                System.out.println("UUID 타입 일치 여부: " + sseEmitters.keySet().contains(targetUuid));
            } catch (IllegalArgumentException e) {
                System.err.println("UUID 변환 실패: " + e.getMessage());
            }
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
     * 특정 알림을 읽음으로 표시
     */
    @PutMapping("/{notificationId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId, 
                                      @AuthenticationPrincipal CustomUserDetails user) {
        System.out.println("=== 알림 읽음 처리 API 호출됨 ===");
        System.out.println("요청된 알림 ID: " + notificationId);
        System.out.println("요청 사용자: " + (user != null ? user.getUserId() : "null"));
        
        if (user == null) {
            System.err.println("=== 인증되지 않은 요청 ===");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "인증이 필요합니다"));
        }
        
        try {
            System.out.println("=== 알림 읽음 처리 시작 ===");
            System.out.println("알림 ID: " + notificationId);
            System.out.println("사용자: " + user.getUserId());
            
            // 알림 존재 여부 먼저 확인
            System.out.println("=== 알림 존재 여부 확인 중 ===");
            
            notificationService.markAsRead(notificationId, UUID.fromString(user.getUserId()));
            
            System.out.println("=== 알림 읽음 처리 완료 ===");
            return ResponseEntity.ok().body(Map.of("message", "알림이 읽음으로 표시되었습니다"));
        } catch (IllegalArgumentException e) {
            System.err.println("=== 알림 찾기 실패 ===");
            System.err.println("알림 ID: " + notificationId);
            System.err.println("사용자 ID: " + user.getUserId());
            System.err.println("오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "알림을 찾을 수 없습니다", "notificationId", notificationId));
        } catch (Exception e) {
            System.err.println("=== 알림 읽음 처리 실패 ===");
            System.err.println("알림 ID: " + notificationId);
            System.err.println("사용자 ID: " + user.getUserId());
            System.err.println("오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "알림 읽음 처리에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 모든 알림을 읽음으로 표시
     */
    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal CustomUserDetails user) {
        try {
            System.out.println("=== 모든 알림 읽음 처리 시작 ===");
            System.out.println("사용자: " + user.getUserId());
            
            notificationService.markAllAsRead(UUID.fromString(user.getUserId()));
            
            System.out.println("=== 모든 알림 읽음 처리 완료 ===");
            return ResponseEntity.ok().body(Map.of("message", "모든 알림이 읽음으로 표시되었습니다"));
        } catch (Exception e) {
            System.err.println("=== 모든 알림 읽음 처리 실패 ===");
            System.err.println("오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "모든 알림 읽음 처리에 실패했습니다: " + e.getMessage()));
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

