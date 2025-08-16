package com.snapfit.api.dto.follow;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 팔로우 상태 응답 DTO
 */
@Data
public class FollowStatusResponseDto {

    private Long targetUserId;
    private Boolean isFollowing;
    private LocalDateTime followedAt;
}
