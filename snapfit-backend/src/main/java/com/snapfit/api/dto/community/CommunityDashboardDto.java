package com.snapfit.api.dto.community;

import lombok.Data;

import java.util.List;

/**
 * 커뮤니티 대시보드 DTO
 */
@Data
public class CommunityDashboardDto {

    private Long totalPosts;
    private Long totalUsers;
    private Long totalComments;
    private Long todayPosts;
    private Long todayComments;
    private List<String> trendingTags;
    private List<String> popularPosts;
    private List<String> activeUsers;
    private Long totalLikes;
    private Long totalScraps;
}
