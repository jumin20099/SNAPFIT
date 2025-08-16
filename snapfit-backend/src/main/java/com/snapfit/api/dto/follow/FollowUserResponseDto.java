package com.snapfit.api.dto.follow;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 팔로우 사용자 응답 DTO
 */
@Data
public class FollowUserResponseDto {

    private Long userId;
    private String username;
    private String profileImage;
    private String bio;
    private Long followerCount;
    private Long followingCount;
    private Long postCount;
    private LocalDateTime followedAt;
}
