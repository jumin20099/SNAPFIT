package com.snapfit.api.dto.community;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 커뮤니티 인사이트 DTO
 */
@Data
public class CommunityInsightsDto {

    private Long totalMembers;
    private Long activeMembers;
    private Long newMembersThisWeek;
    private List<String> topContributors;
    private Map<String, Long> engagementByTime;
    private Map<String, Long> contentByCategory;
    private List<String> trendingTopics;
    private Double communityHealthScore;
    private String growthTrend;
    private List<String> recommendations;
}
