package com.snapfit.api.dto.community;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 커뮤니티 통계 DTO
 */
@Data
public class CommunityStatisticsDto {

    private Long totalPosts;
    private Long totalUsers;
    private Long totalComments;
    private Long totalLikes;
    private Long totalScraps;
    private Long todayPosts;
    private Long todayComments;
    private Long todayLikes;
    private Long todayScraps;
    private List<String> topTags;
    private Map<String, Long> postsByCategory;
    private Map<String, Long> activityByHour;
    private Double averagePostsPerUser;
    private Double averageCommentsPerPost;
}
