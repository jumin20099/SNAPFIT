package com.snapfit.api.dto.follow;

import lombok.Data;

/**
 * 팔로우 통계 DTO
 */
@Data
public class FollowStatisticsDto {

    private Long userId;
    private Long followerCount;
    private Long followingCount;
    private Long mutualFollowCount;
    private Long todayNewFollowers;
    private Long thisWeekNewFollowers;
}
