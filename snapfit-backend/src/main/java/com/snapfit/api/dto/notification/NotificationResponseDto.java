package com.snapfit.api.dto.notification;

import com.snapfit.api.entity.Notification;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class NotificationResponseDto {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String timestamp;
    private boolean read;
    private String avatar;
    private String image;
    private String userName;
    private Long refId;

    public static NotificationResponseDto fromEntity(Notification notification) {
        // 알림 타입에 따른 제목과 메시지 생성
        String title = "";
        String message = "";
        String avatar = null;
        String image = null;
        String userName = null;

        switch (notification.getType()) {
            case LIKE:
                title = "좋아요";
                message = "회원님이 좋아한 게시물에 새로운 좋아요가 달렸습니다.";
                break;
            case COMMENT:
                title = "댓글";
                message = "회원님이 작성한 게시물에 새로운 댓글이 달렸습니다.";
                break;
            case FOLLOW:
                title = "팔로우";
                message = "새로운 팔로워가 생겼습니다.";
                break;
            case SYSTEM:
                title = "시스템 알림";
                try {
                    if (notification.getPayloadJson() != null) {
                        ObjectMapper mapper = new ObjectMapper();
                        Map<String, Object> payload = mapper.readValue(notification.getPayloadJson(), new TypeReference<Map<String, Object>>() {});
                        message = payload.get("message") != null ? payload.get("message").toString() : "새로운 시스템 알림이 있습니다.";
                    } else {
                        message = "새로운 시스템 알림이 있습니다.";
                    }
                } catch (Exception e) {
                    message = "새로운 시스템 알림이 있습니다.";
                }
                break;
        }

        return NotificationResponseDto.builder()
                .id(notification.getNotificationId())
                .type(notification.getType().toString())
                .title(title)
                .message(message)
                .timestamp(notification.getCreatedAt().toString())
                .read(notification.getIsRead())
                .avatar(avatar)
                .image(image)
                .userName(userName)
                .refId(notification.getRefId())
                .build();
    }
}
