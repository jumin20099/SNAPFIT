package com.snapfit.api.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapfit.api.dto.profile.ProfileResponseDto;
import com.snapfit.api.dto.profile.ProfileUpdateRequestDto;
import com.snapfit.api.entity.Follow;
import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.FollowRepository;
import com.snapfit.api.repository.PostRepository;
import com.snapfit.api.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;

    /**
     * 사용자 프로필 조회
     */
    @Transactional(readOnly = true)
    public ProfileResponseDto getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 현재 로그인한 사용자 정보
        User currentUser = getCurrentUser();
        boolean isOwnProfile = currentUser != null && currentUser.getUserIdx().equals(userId);
        boolean isFollowing = false;

        if (currentUser != null && !isOwnProfile) {
            isFollowing = followRepository.existsByFollowerAndFollowee(currentUser, user);
        }

        // 사용자가 작성한 글 조회 (최신순, 20개)
        List<Post> userPosts = postRepository.findByAuthorOrderByCreatedAtDesc(user, 
            org.springframework.data.domain.PageRequest.of(0, 20)).getContent();

        // 팔로워/팔로잉 수 조회
        long followerCount = followRepository.countByFollowee(user);
        long followingCount = followRepository.countByFollower(user);

        return ProfileResponseDto.builder()
            .userId(user.getUserIdx())
            .nickname(user.getNickname())
            .profileImage(user.getProfileImage())
            .bio(user.getBio())
            .followerCount((int) followerCount)
            .followingCount((int) followingCount)
            .isFollowing(isFollowing)
            .isOwnProfile(isOwnProfile)
            .posts(userPosts.stream().map(this::convertToPostSummary).collect(Collectors.toList()))
            .build();
    }

    /**
     * 프로필 수정
     */
    @Transactional
    public ProfileResponseDto updateProfile(ProfileUpdateRequestDto request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }

        // 닉네임 중복 확인 (변경하는 경우)
        if (request.getNickname() != null && !request.getNickname().equals(currentUser.getNickname())) {
            if (userRepository.findByNickname(request.getNickname()).isPresent()) {
                throw new RuntimeException("이미 사용 중인 닉네임입니다.");
            }
        }

        // 프로필 정보 업데이트
        if (request.getNickname() != null) {
            currentUser.setNickname(request.getNickname());
        }
        if (request.getProfileImage() != null) {
            currentUser.setProfileImage(request.getProfileImage());
        }
        if (request.getBio() != null) {
            currentUser.setBio(request.getBio());
        }

        userRepository.save(currentUser);

        log.info("프로필 수정 완료: userId={}, nickname={}", currentUser.getUserIdx(), currentUser.getNickname());

        return getProfile(currentUser.getUserIdx());
    }

    /**
     * 팔로우
     */
    @Transactional
    public void followUser(UUID targetUserId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }

        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (currentUser.getUserIdx().equals(targetUserId)) {
            throw new RuntimeException("자신을 팔로우할 수 없습니다.");
        }

        // 이미 팔로우 중인지 확인
        if (followRepository.existsByFollowerAndFollowee(currentUser, targetUser)) {
            throw new RuntimeException("이미 팔로우 중입니다.");
        }

        // 팔로우 관계 생성
        Follow follow = Follow.builder()
            .follower(currentUser)
            .followee(targetUser)
            .build();

        followRepository.save(follow);

        // 팔로워/팔로잉 수 업데이트
        updateFollowCounts(targetUser);
        updateFollowCounts(currentUser);

        log.info("팔로우 완료: follower={}, following={}", currentUser.getUserIdx(), targetUserId);
    }

    /**
     * 언팔로우
     */
    @Transactional
    public void unfollowUser(UUID targetUserId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }

        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Follow follow = followRepository.findByFollowerAndFollowee(currentUser, targetUser)
            .orElseThrow(() -> new RuntimeException("팔로우 관계가 없습니다."));

        followRepository.delete(follow);

        // 팔로워/팔로잉 수 업데이트
        updateFollowCounts(targetUser);
        updateFollowCounts(currentUser);

        log.info("언팔로우 완료: follower={}, following={}", currentUser.getUserIdx(), targetUserId);
    }

    /**
     * 팔로워/팔로잉 수 업데이트
     */
    private void updateFollowCounts(User user) {
        long followerCount = followRepository.countByFollowee(user);
        long followingCount = followRepository.countByFollower(user);
        
        user.setFollowerCount((int) followerCount);
        user.setFollowingCount((int) followingCount);
        
        userRepository.save(user);
    }

    /**
     * Post를 PostSummaryDto로 변환
     */
    private ProfileResponseDto.PostSummaryDto convertToPostSummary(Post post) {
        return ProfileResponseDto.PostSummaryDto.builder()
            .postId(post.getPostId())
            .title(post.getTitle())
            .content(post.getContent())
            .thumbnailImage(post.getMediaUrls() != null && !post.getMediaUrls().isEmpty() 
                ? post.getMediaUrls().iterator().next() : null)
            .likeCount(post.getLikeCount().intValue())
            .commentCount(post.getCommentCount().intValue())
            .scrapCount(post.getScrapCount().intValue())
            .createdAt(post.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
            .build();
    }

    /**
     * 현재 로그인한 사용자 조회
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getName())) {
            return null;
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}
