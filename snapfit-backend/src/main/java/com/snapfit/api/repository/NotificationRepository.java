package com.snapfit.api.repository;

import com.snapfit.api.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 알림 리포지토리 인터페이스
 * 보안과 성능을 고려한 커스텀 쿼리 메서드
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 사용자별 알림 목록 조회 (페이징)
     * 성능: user_id 인덱스 활용
     */
    @Query("SELECT n FROM Notification n WHERE n.user.userIdx = :userId ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 읽지 않은 알림 목록 조회
     * 성능: 복합 인덱스 활용
     */
    @Query("SELECT n FROM Notification n WHERE n.user.userIdx = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    /**
     * 사용자별 읽지 않은 알림 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.userIdx = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") UUID userId);

    /**
     * 사용자별 알림 타입별 목록 조회
     * 성능: 복합 인덱스 활용
     */
    @Query("SELECT n FROM Notification n WHERE n.user.userIdx = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(@Param("userId") UUID userId, 
                                                              @Param("type") Notification.NotificationType type, 
                                                              Pageable pageable);

    /**
     * 사용자별 알림 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT n.type as notificationType, COUNT(n) as count, COUNT(CASE WHEN n.isRead = false THEN 1 END) as unreadCount " +
           "FROM Notification n " +
           "WHERE n.user.userIdx = :userId " +
           "GROUP BY n.type " +
           "ORDER BY count DESC")
    List<Object[]> getNotificationStatisticsByUserId(@Param("userId") UUID userId);

    /**
     * 알림 만료 처리 (30일 이상 된 알림)
     * 성능: 날짜 인덱스 활용
     */
    @Query("SELECT n FROM Notification n WHERE n.createdAt < :expiryDate")
    List<Notification> findExpiredNotifications(@Param("expiryDate") LocalDateTime expiryDate);

    /**
     * 사용자별 알림 우선순위별 목록 조회
     * 성능: 우선순위 계산 최적화
     */
    @Query("SELECT n FROM Notification n WHERE n.user.userIdx = :userId ORDER BY " +
           "CASE n.type " +
           "  WHEN 'SYSTEM' THEN 1 " +
           "  WHEN 'REPORT_RESULT' THEN 2 " +
           "  WHEN 'MENTION' THEN 3 " +
           "  WHEN 'COMMENT' THEN 4 " +
           "  WHEN 'LIKE' THEN 5 " +
           "  WHEN 'SCRAP' THEN 6 " +
           "  WHEN 'FOLLOW' THEN 7 " +
           "  ELSE 8 " +
           "END ASC, n.createdAt DESC")
    Page<Notification> findByUserIdOrderByPriorityAndCreatedAtDesc(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 알림 목록 조회 (생성일 기준 내림차순)
     * 성능: user_id 인덱스 활용
     */
    Page<Notification> findByUser_UserIdxOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * 사용자별 읽지 않은 알림 수 조회
     * 성능: 복합 인덱스 활용
     */
    long countByUser_UserIdxAndIsReadFalse(UUID userId);

    /**
     * 사용자별 전체 알림 수 조회
     * 성능: user_id 인덱스 활용
     */
    long countByUser_UserIdx(UUID userId);

    /**
     * 사용자별 마지막 알림 시간 조회
     * 성능: user_id 인덱스 활용
     */
    @Query("SELECT MAX(n.createdAt) FROM Notification n WHERE n.user.userIdx = :userId")
    LocalDateTime findLastNotificationTimeByUserId(@Param("userId") UUID userId);

    /**
     * 사용자별 알림 타입별 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT n.type as notificationType, COUNT(n) as count " +
           "FROM Notification n " +
           "WHERE n.user.userIdx = :userId " +
           "GROUP BY n.type " +
           "ORDER BY count DESC")
    List<Object[]> getNotificationTypeStatsByUserId(@Param("userId") UUID userId);

    /**
     * 사용자별 모든 알림 읽음 처리
     * 성능: 배치 업데이트
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userIdx = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") UUID userId);
}
