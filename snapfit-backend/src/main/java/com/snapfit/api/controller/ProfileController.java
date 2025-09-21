package com.snapfit.api.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapfit.api.dto.profile.ProfileResponseDto;
import com.snapfit.api.dto.profile.ProfileUpdateRequestDto;
import com.snapfit.api.service.ProfileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final ProfileService profileService;

    /**
     * 사용자 프로필 조회
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDto> getProfile(@PathVariable UUID userId) {
        try {
            ProfileResponseDto profile = profileService.getProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("프로필 조회 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 프로필 수정
     */
    @PutMapping("/me")
    public ResponseEntity<ProfileResponseDto> updateProfile(@RequestBody ProfileUpdateRequestDto request) {
        try {
            ProfileResponseDto updatedProfile = profileService.updateProfile(request);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            log.error("프로필 수정 실패: error={}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 팔로우
     */
    @PostMapping("/{userId}/follow")
    public ResponseEntity<Void> followUser(@PathVariable UUID userId) {
        try {
            profileService.followUser(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("팔로우 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 언팔로우
     */
    @PostMapping("/{userId}/unfollow")
    public ResponseEntity<Void> unfollowUser(@PathVariable UUID userId) {
        try {
            profileService.unfollowUser(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("언팔로우 실패: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
