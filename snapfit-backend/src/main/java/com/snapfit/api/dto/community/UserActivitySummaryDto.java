package com.snapfit.api.dto.community;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 사용자 활동 요약 DTO
 */
@Data
public class UserActivitySummaryDto {

    private Long userId;
    private String username;
    private Long totalPosts;
    private Long totalComments;
    private Long totalLikes;
    private Long totalScraps;
    private Long followerCount;
    private Long followingCount;
    private LocalDateTime lastActivityAt;
    private String lastActivityType;
    private Long thisWeekPosts;
    private Long thisWeekComments;
    private Long thisWeekLikes;
}
