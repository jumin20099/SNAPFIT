package com.snapfit.api.dto.follow;

import lombok.Data;

/**
 * 팔로우 토글 응답 DTO
 */
@Data
public class FollowToggleResponseDto {

    private Long targetUserId;
    private Boolean isFollowing;
    private Long followerCount;
    private Long followingCount;
}
