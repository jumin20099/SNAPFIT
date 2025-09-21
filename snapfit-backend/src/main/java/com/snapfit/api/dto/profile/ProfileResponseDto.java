package com.snapfit.api.dto.profile;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponseDto {
    
    private UUID userId;
    private String nickname;
    private String profileImage;
    private String bio;
    private Integer followerCount;
    private Integer followingCount;
    private Boolean isFollowing; // 현재 로그인한 사용자가 이 사용자를 팔로우하는지 여부
    private Boolean isOwnProfile; // 자신의 프로필인지 여부
    private List<PostSummaryDto> posts; // 작성한 글 목록
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PostSummaryDto {
        private Long postId;
        private String title;
        private String content;
        private String thumbnailImage;
        private Integer likeCount;
        private Integer commentCount;
        private Integer scrapCount;
        private String createdAt;
    }
}
