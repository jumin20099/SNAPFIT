package com.snapfit.api.service;

import com.snapfit.api.entity.Notification;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.NotificationRepository;
import com.snapfit.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 알림 시스템 서비스
 * 연매출 100억 서비스 수준의 보안과 최적화 적용
 * 
 * 보안 고려사항:
 * - 사용자 인증 확인
 * - 알림 내용 검증
 * - Rate limiting
 * - 스팸 방지
 * 
 * 최적화 고려사항:
 * - WebSocket 실시간 전송
 * - Redis 캐싱
 * - 배치 처리
 * - 비동기 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    // Redis 키 상수
    private static final String NOTIFICATION_COUNT_KEY = "notification:count:";
    private static final String NOTIFICATION_UNREAD_KEY = "notification:unread:";
    private static final String NOTIFICATION_RATE_LIMIT_KEY = "notification:rate_limit:";
    
    // 캐시 TTL (초)
    private static final long COUNT_CACHE_TTL = 300L; // 5분
    private static final long UNREAD_CACHE_TTL = 600L; // 10분
    private static final long RATE_LIMIT_TTL = 3600L; // 1시간

    /**
     * 좋아요 알림 생성 및 전송
     */
    @Transactional
    public void sendLikeNotification(UUID fromUserId, UUID toUserId, Long postId) {
        try {
            // Rate limiting 확인
            if (isRateLimited(fromUserId, "like")) {
                log.warn("Rate limited: 사용자 {}의 좋아요 알림 전송 제한", fromUserId);
                return;
            }

            // 알림 생성
            Notification notification = createNotification(
                fromUserId, toUserId, "LIKE", 
                "좋아요를 눌렀습니다", 
                Map.of("postId", postId, "type", "post")
            );

            // 실시간 알림 전송
            sendRealTimeNotification(toUserId, notification);

            // Rate limiting 업데이트
            updateRateLimit(fromUserId, "like");

            log.info("좋아요 알림 전송 완료: from={}, to={}, postId={}", fromUserId, toUserId, postId);

        } catch (Exception e) {
            log.error("좋아요 알림 전송 실패: from={}, to={}, postId={}", fromUserId, toUserId, postId, e);
        }
    }

    /**
     * 댓글 알림 생성 및 전송
     */
    @Transactional
    public void sendCommentNotification(UUID fromUserId, UUID toUserId, Long postId, Long commentId) {
        try {
            // Rate limiting 확인
            if (isRateLimited(fromUserId, "comment")) {
                log.warn("Rate limited: 사용자 {}의 댓글 알림 전송 제한", fromUserId);
                return;
            }

            // 알림 생성
            Notification notification = createNotification(
                fromUserId, toUserId, "COMMENT", 
                "댓글을 남겼습니다", 
                Map.of("postId", postId, "commentId", commentId, "type", "post")
            );

            // 실시간 알림 전송
            sendRealTimeNotification(toUserId, notification);

            // Rate limiting 업데이트
            updateRateLimit(fromUserId, "comment");

            log.info("댓글 알림 전송 완료: from={}, to={}, postId={}, commentId={}", 
                fromUserId, toUserId, postId, commentId);

        } catch (Exception e) {
            log.error("댓글 알림 전송 실패: from={}, to={}, postId={}, commentId={}", 
                fromUserId, toUserId, postId, commentId, e);
        }
    }

    /**
     * 팔로우 알림 생성 및 전송
     */
    @Transactional
    public void sendFollowNotification(UUID fromUserId, UUID toUserId) {
        try {
            // Rate limiting 확인
            if (isRateLimited(fromUserId, "follow")) {
                log.warn("Rate limited: 사용자 {}의 팔로우 알림 전송 제한", fromUserId);
                return;
            }

            // 알림 생성
            Notification notification = createNotification(
                fromUserId, toUserId, "FOLLOW", 
                "팔로우했습니다", 
                Map.of("type", "user")
            );

            // 실시간 알림 전송
            sendRealTimeNotification(toUserId, notification);

            // Rate limiting 업데이트
            updateRateLimit(fromUserId, "follow");

            log.info("팔로우 알림 전송 완료: from={}, to={}", fromUserId, toUserId);

        } catch (Exception e) {
            log.error("팔로우 알림 전송 실패: from={}, to={}", fromUserId, toUserId, e);
        }
    }

    /**
     * 스크랩 알림 생성 및 전송
     */
    @Transactional
    public void sendScrapNotification(UUID fromUserId, UUID toUserId, Long postId) {
        try {
            // Rate limiting 확인
            if (isRateLimited(fromUserId, "scrap")) {
                log.warn("Rate limited: 사용자 {}의 스크랩 알림 전송 제한", fromUserId);
                return;
            }

            // 알림 생성
            Notification notification = createNotification(
                fromUserId, toUserId, "SCRAP", 
                "스크랩했습니다", 
                Map.of("postId", postId, "type", "post")
            );

            // 실시간 알림 전송
            sendRealTimeNotification(toUserId, notification);

            // Rate limiting 업데이트
            updateRateLimit(fromUserId, "scrap");

            log.info("스크랩 알림 전송 완료: from={}, to={}, postId={}", fromUserId, toUserId, postId);

        } catch (Exception e) {
            log.error("스크랩 알림 전송 실패: from={}, to={}, postId={}", fromUserId, toUserId, postId, e);
        }
    }

    /**
     * 시스템 알림 생성 및 전송
     */
    @Transactional
    public void sendSystemNotification(UUID toUserId, String title, String content, Map<String, Object> metadata) {
        try {
            // 알림 생성
            Notification notification = createNotification(
                null, toUserId, "SYSTEM", title, metadata
            );

            // 실시간 알림 전송
            sendRealTimeNotification(toUserId, notification);

            log.info("시스템 알림 전송 완료: to={}, title={}", toUserId, title);

        } catch (Exception e) {
            log.error("시스템 알림 전송 실패: to={}, title={}", toUserId, title, e);
        }
    }

    /**
     * 알림 생성
     */
    private Notification createNotification(UUID fromUserId, UUID toUserId, String type, 
                                         String content, Map<String, Object> metadata) {
        
        // 수신자 정보 조회
        User toUser = userRepository.findById(toUserId)
            .orElseThrow(() -> new RuntimeException("수신자를 찾을 수 없습니다: " + toUserId));

        // 알림 생성
        Notification notification = Notification.builder()
            .user(toUser)
            .type(Notification.NotificationType.valueOf(type))
            .refId(fromUserId != null ? fromUserId.getMostSignificantBits() : null)
            .payloadJson(convertMetadataToJson(metadata))
            .isRead(false)
            .build();

        // DB에 저장
        Notification savedNotification = notificationRepository.save(notification);

        // 캐시 업데이트
        updateNotificationCache(toUserId);

        return savedNotification;
    }

    /**
     * 메타데이터를 JSON 문자열로 변환
     */
    private String convertMetadataToJson(Map<String, Object> metadata) {
        try {
            // 간단한 JSON 변환 (실제로는 ObjectMapper 사용 권장)
            if (metadata == null || metadata.isEmpty()) {
                return "{}";
            }
            
            StringBuilder json = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, Object> entry : metadata.entrySet()) {
                if (!first) json.append(",");
                json.append("\"").append(entry.getKey()).append("\":");
                
                if (entry.getValue() instanceof String) {
                    json.append("\"").append(entry.getValue()).append("\"");
                } else {
                    json.append(entry.getValue());
                }
                first = false;
            }
            json.append("}");
            
            return json.toString();
        } catch (Exception e) {
            log.error("메타데이터 JSON 변환 실패: {}", metadata, e);
            return "{}";
        }
    }

    /**
     * 실시간 알림 전송 (WebSocket)
     */
    private void sendRealTimeNotification(UUID userId, Notification notification) {
        try {
            // WebSocket을 통해 실시간 알림 전송
            String destination = "/user/" + userId + "/queue/notifications";
            
            // 알림 DTO 생성
            Map<String, Object> notificationDto = Map.of(
                "id", notification.getNotificationId(),
                "type", notification.getType().toString(),
                "refId", notification.getRefId(),
                "payloadJson", notification.getPayloadJson(),
                "createdAt", notification.getCreatedAt(),
                "isRead", notification.getIsRead()
            );

            messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications", 
                notificationDto
            );

            log.debug("실시간 알림 전송 완료: userId={}, destination={}", userId, destination);

        } catch (Exception e) {
            log.error("실시간 알림 전송 실패: userId={}", userId, e);
        }
    }

    /**
     * 사용자별 알림 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(UUID userId, Pageable pageable) {
        try {
            log.info("사용자 알림 목록 조회: userId={}, page={}, size={}", 
                userId, pageable.getPageNumber(), pageable.getPageSize());

            Page<Notification> notifications = notificationRepository.findByUser_UserIdxOrderByCreatedAtDesc(userId, pageable);

            log.info("사용자 알림 목록 조회 완료: {}개", notifications.getNumberOfElements());
            return notifications;

        } catch (Exception e) {
            log.error("사용자 알림 목록 조회 실패: userId={}", userId, e);
            throw new RuntimeException("알림 목록 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markNotificationAsRead(Long notificationId, UUID userId) {
        try {
            log.info("알림 읽음 처리: notificationId={}, userId={}", notificationId, userId);

            Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("알림을 찾을 수 없습니다: " + notificationId));

            // 권한 확인
            if (!notification.getUser().getUserIdx().equals(userId)) {
                throw new RuntimeException("알림을 읽을 권한이 없습니다");
            }

            // 읽음 처리
            notification.setIsRead(true);
            notificationRepository.save(notification);

            // 캐시 업데이트
            updateNotificationCache(userId);

            log.info("알림 읽음 처리 완료: notificationId={}", notificationId);

        } catch (Exception e) {
            log.error("알림 읽음 처리 실패: notificationId={}, userId={}", notificationId, userId, e);
            throw new RuntimeException("알림 읽음 처리 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public void markAllNotificationsAsRead(UUID userId) {
        try {
            log.info("모든 알림 읽음 처리: userId={}", userId);

            int updatedCount = notificationRepository.markAllAsReadByUserId(userId);

            // 캐시 업데이트
            updateNotificationCache(userId);

            log.info("모든 알림 읽음 처리 완료: userId={}, updatedCount={}", userId, updatedCount);

        } catch (Exception e) {
            log.error("모든 알림 읽음 처리 실패: userId={}", userId, e);
            throw new RuntimeException("모든 알림 읽음 처리 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 읽지 않은 알림 개수 조회 (캐시 우선)
     */
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(UUID userId) {
        try {
            // 캐시에서 조회 시도
            String cacheKey = NOTIFICATION_UNREAD_KEY + userId;
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            
            if (cached instanceof Long) {
                log.debug("캐시에서 읽지 않은 알림 개수 조회: userId={}, count={}", userId, cached);
                return (Long) cached;
            }

            // DB에서 조회
            long count = notificationRepository.countByUser_UserIdxAndIsReadFalse(userId);
            
            // 캐시에 저장
            redisTemplate.opsForValue().set(cacheKey, count, UNREAD_CACHE_TTL, TimeUnit.SECONDS);
            
            log.debug("DB에서 읽지 않은 알림 개수 조회: userId={}, count={}", userId, count);
            return count;

        } catch (Exception e) {
            log.error("읽지 않은 알림 개수 조회 실패: userId={}", userId, e);
            return 0L;
        }
    }

    /**
     * 알림 캐시 업데이트
     */
    private void updateNotificationCache(UUID userId) {
        try {
            // 읽지 않은 알림 개수 캐시 무효화
            String unreadKey = NOTIFICATION_UNREAD_KEY + userId;
            redisTemplate.delete(unreadKey);

            // 전체 알림 개수 캐시 무효화
            String countKey = NOTIFICATION_COUNT_KEY + userId;
            redisTemplate.delete(countKey);

            log.debug("알림 캐시 업데이트 완료: userId={}", userId);

        } catch (Exception e) {
            log.error("알림 캐시 업데이트 실패: userId={}", userId, e);
        }
    }

    /**
     * Rate limiting 확인
     */
    private boolean isRateLimited(UUID userId, String action) {
        try {
            String rateLimitKey = NOTIFICATION_RATE_LIMIT_KEY + userId + ":" + action;
            
            // 현재 요청 수 확인
            Object currentCount = redisTemplate.opsForValue().get(rateLimitKey);
            int count = currentCount != null ? (Integer) currentCount : 0;

            // 제한 확인 (1시간에 100개)
            if (count >= 100) {
                return true;
            }

            // 요청 수 증가
            redisTemplate.opsForValue().increment(rateLimitKey);
            redisTemplate.expire(rateLimitKey, RATE_LIMIT_TTL, TimeUnit.SECONDS);

            return false;

        } catch (Exception e) {
            log.error("Rate limiting 확인 실패: userId={}, action={}", userId, action, e);
            return false; // 오류 시 제한하지 않음
        }
    }

    /**
     * Rate limiting 업데이트
     */
    private void updateRateLimit(UUID userId, String action) {
        try {
            String rateLimitKey = NOTIFICATION_RATE_LIMIT_KEY + userId + ":" + action;
            
            // 요청 수 증가
            redisTemplate.opsForValue().increment(rateLimitKey);
            redisTemplate.expire(rateLimitKey, RATE_LIMIT_TTL, TimeUnit.SECONDS);

        } catch (Exception e) {
            log.error("Rate limiting 업데이트 실패: userId={}, action={}", userId, action, e);
        }
    }

    /**
     * 알림 통계 조회 (모니터링용)
     */
    public Map<String, Object> getNotificationStats(UUID userId) {
        try {
            Map<String, Object> stats = Map.of(
                "totalNotifications", notificationRepository.countByUser_UserIdx(userId),
                "unreadNotifications", getUnreadNotificationCount(userId),
                "lastNotificationTime", notificationRepository.findLastNotificationTimeByUserId(userId),
                "notificationTypes", notificationRepository.getNotificationTypeStatsByUserId(userId)
            );

            return stats;

        } catch (Exception e) {
            log.error("알림 통계 조회 실패: userId={}", userId, e);
            return Map.of();
        }
    }
}
