package com.snapfit.api.controller;

import com.snapfit.api.dto.notification.NotificationResponseDto;
import com.snapfit.api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

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
     * 특정 알림을 읽음 처리합니다
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UUID userId = UUID.fromString(userDetails.getUsername());
            notificationService.markAsRead(notificationId, userId);
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
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("테스트 알림 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
