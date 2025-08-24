package com.snapfit.api.controller;

import com.snapfit.api.entity.Follow;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.FollowRepository;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.service.FollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.UUID;

/**
 * 팔로우/팔로잉 API 컨트롤러
 * 사용자 간 팔로우 관계 관리
 */
@Slf4j
@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
@Tag(name = "Follow", description = "팔로우/팔로잉 관리 API")
public class FollowController {

    private final FollowService followService;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Operation(summary = "사용자 팔로우", description = "특정 사용자를 팔로우합니다")
    @ApiResponse(responseCode = "201", description = "팔로우 성공")
    @ApiResponse(responseCode = "400", description = "자기 자신을 팔로우하거나 이미 팔로우 중")
    @ApiResponse(responseCode = "401", description = "인증 필요")
    @PostMapping("/{userId}")
    public ResponseEntity<?> followUser(
            @Parameter(description = "팔로우할 사용자 ID") @PathVariable UUID userId,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest request) {
        
        // 임시로 인증 우회 - 현재 사용자를 김주민으로 설정
        String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7";
        log.info("팔로우 API 호출됨 - 임시 인증 우회");

        try {
            log.info("팔로우 요청: {} -> {}", currentUserId, userId);
            
            UUID currentUUID = UUID.fromString(currentUserId);
            
            // 자기 자신 팔로우 방지
            if (currentUUID.equals(userId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "자기 자신을 팔로우할 수 없습니다"));
            }
            
            // 팔로우 상태 확인 및 토글 처리
            boolean isCurrentlyFollowing = followService.isFollowing(currentUUID, userId);
            
            if (isCurrentlyFollowing) {
                // 이미 팔로우 중인 경우 - 팔로워 수만 반환
                long followerCount = followRepository.countFollowersByFolloweeId(userId);
                log.info("이미 팔로우 중: {} -> {}, 팔로워 수: {}", currentUUID, userId, followerCount);
                
                return ResponseEntity.ok()
                    .body(Map.of(
                        "following", true,
                        "followerCount", followerCount,
                        "message", "이미 팔로우 중입니다"
                    ));
            } else {
                // 팔로우하지 않은 경우 - 새로 팔로우
                followService.follow(currentUUID, userId);
                long followerCount = followRepository.countFollowersByFolloweeId(userId);
                
                log.info("팔로우 성공 (DB 저장): {} -> {}, 팔로워 수: {}", currentUUID, userId, followerCount);
                
                return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                        "following", true,
                        "followerCount", followerCount
                    ));
            }
                
        } catch (Exception e) {
            log.error("팔로우 실패: {} -> {}, 오류: {}", currentUserId, userId, e.getMessage());
            
            // 이미 팔로우한 경우의 메시지 처리
            if (e.getMessage().contains("이미 팔로우")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "이미 팔로우한 사용자입니다"));
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "팔로우 처리 중 오류가 발생했습니다"));
        }
    }

    @Operation(summary = "사용자 언팔로우", description = "특정 사용자를 언팔로우합니다")
    @ApiResponse(responseCode = "200", description = "언팔로우 성공")
    @ApiResponse(responseCode = "401", description = "인증 필요")
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> unfollowUser(
            @Parameter(description = "언팔로우할 사용자 ID") @PathVariable UUID userId,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest request) {
        
        // 임시로 인증 우회 - 현재 사용자를 김주민으로 설정
        String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7";
        log.info("언팔로우 API 호출됨 - 임시 인증 우회");

        try {
            log.info("언팔로우 요청: {} -> {}", currentUserId, userId);
            
            UUID currentUUID = UUID.fromString(currentUserId);
            
            // 자기 자신 언팔로우 방지
            if (currentUUID.equals(userId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "자기 자신을 언팔로우할 수 없습니다"));
            }
            
            // 실제 DB에서 언팔로우
            followService.unfollow(currentUUID, userId);
            
            // 팔로워 수 조회
            long followerCount = followRepository.countFollowersByFolloweeId(userId);
            
            log.info("언팔로우 성공 (DB 저장): {} -> {}, 팔로워 수: {}", currentUUID, userId, followerCount);
            
            return ResponseEntity.ok()
                .body(Map.of(
                    "following", false,
                    "followerCount", followerCount
                ));
                
        } catch (Exception e) {
            log.error("언팔로우 실패: {} -> {}, 오류: {}", currentUserId, userId, e.getMessage());
            
            // 팔로우 관계가 없는 경우의 메시지 처리
            if (e.getMessage().contains("팔로우 관계를 찾을 수 없습니다")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "팔로우 관계가 존재하지 않습니다"));
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "언팔로우 처리 중 오류가 발생했습니다"));
        }
    }

    @Operation(summary = "팔로우 상태 확인", description = "특정 사용자에 대한 팔로우 상태를 확인합니다")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/{userId}/status")
    public ResponseEntity<?> getFollowStatus(
            @Parameter(description = "확인할 사용자 ID") @PathVariable UUID userId,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest request) {
        
        // 임시로 인증 우회 - 현재 사용자를 김주민으로 설정
        String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7";
        log.info("팔로우 상태 확인 API 호출됨 - 임시 인증 우회");

        try {
            UUID currentUUID = UUID.fromString(currentUserId);
            boolean isFollowing = followService.isFollowing(currentUUID, userId);
            long followerCount = followRepository.countFollowersByFolloweeId(userId);
            
            log.info("팔로우 상태 확인 완료: {} -> {}, 팔로우 여부: {}, 팔로워 수: {}", 
                    currentUUID, userId, isFollowing, followerCount);
            
            return ResponseEntity.ok(Map.of(
                "following", isFollowing,
                "followerCount", followerCount
            ));
                
        } catch (Exception e) {
            log.error("팔로우 상태 확인 실패: {} -> {}, 오류: {}", currentUserId, userId, e.getMessage());
            return ResponseEntity.ok(Map.of(
                "following", false,
                "followerCount", 0
            ));
        }
    }

    @Operation(summary = "팔로워 목록 조회", description = "특정 사용자의 팔로워 목록을 조회합니다")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(
            @Parameter(description = "사용자 ID") @PathVariable UUID userId,
            @PageableDefault(size = 20) Pageable pageable) {
        
        try {
            Page<Follow> followers = followService.getUserFollowers(userId, pageable);
            return ResponseEntity.ok(followers);
                
        } catch (Exception e) {
            log.error("팔로워 목록 조회 실패: {}, 오류: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "팔로워 목록 조회 중 오류가 발생했습니다"));
        }
    }

    @Operation(summary = "팔로잉 목록 조회", description = "특정 사용자의 팔로잉 목록을 조회합니다")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(
            @Parameter(description = "사용자 ID") @PathVariable UUID userId,
            @PageableDefault(size = 20) Pageable pageable) {
        
        try {
            Page<Follow> following = followService.getUserFollowings(userId, pageable);
            return ResponseEntity.ok(following);
                
        } catch (Exception e) {
            log.error("팔로잉 목록 조회 실패: {}, 오류: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "팔로잉 목록 조회 중 오류가 발생했습니다"));
        }
    }
}
