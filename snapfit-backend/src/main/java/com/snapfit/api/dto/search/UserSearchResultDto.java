package com.snapfit.api.dto.search;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 사용자 검색 결과 DTO
 */
@Data
public class UserSearchResultDto {

    private Long userId;
    private String username;
    private String profileImage;
    private String bio;
    private Long followerCount;
    private Long followingCount;
    private Long postCount;
    private LocalDateTime joinedAt;
    private Double relevanceScore;
    private String matchedField;
}
