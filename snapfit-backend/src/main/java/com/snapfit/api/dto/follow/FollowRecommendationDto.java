package com.snapfit.api.dto.follow;

import lombok.Data;

/**
 * 팔로우 추천 DTO
 */
@Data
public class FollowRecommendationDto {

    private Long userId;
    private String username;
    private String profileImage;
    private String bio;
    private Long followerCount;
    private Long postCount;
    private Double recommendationScore;
    private String reason;
}
