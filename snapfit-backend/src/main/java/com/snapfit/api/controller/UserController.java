package com.snapfit.api.controller;

import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.snapfit.api.repository.PartnerApplicationRepository;
import com.snapfit.api.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartnerApplicationRepository partnerApplicationRepository;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getName())) {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userIdx", user.getUserIdx().toString()); // userIdx 필드 추가
                userInfo.put("email", user.getEmail());
                userInfo.put("role", user.getRole().name());
                userInfo.put("nickname", user.getNickname());
                var apps = partnerApplicationRepository.findByUserIdx(user.getUserIdx());
                if (!apps.isEmpty()) {
                    userInfo.put("partner_application_id", apps.get(0).getId());
                }
                return ResponseEntity.ok(userInfo);
            }
        }
        Map<String, Object> defaultInfo = new HashMap<>();
        defaultInfo.put("role", "USER");
        return ResponseEntity.ok(defaultInfo);
    }

    @PatchMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, Object> updateRequest) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "error", "인증이 필요합니다",
                "code", "UNAUTHORIZED"
            ));
        }
        
        String email = authentication.getName();
        log.info("프로필 업데이트 요청: email={}", email);
        
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "error", "사용자를 찾을 수 없습니다",
                    "code", "USER_NOT_FOUND"
                ));
            }
            
            User user = userOpt.get();
            UUID userId = user.getUserIdx();

            boolean updated = false;
            
            // 닉네임 업데이트
            if (updateRequest.containsKey("nickname")) {
                String newNickname = (String) updateRequest.get("nickname");
                
                // 닉네임 유효성 검사
                if (newNickname == null || newNickname.trim().length() < 2 || newNickname.trim().length() > 20) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "닉네임은 2자 이상 20자 이하여야 합니다",
                        "code", "INVALID_NICKNAME_LENGTH"
                    ));
                }
                
                if (!newNickname.matches("^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\\s]+$")) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "닉네임은 한글, 영문, 숫자, 공백만 사용할 수 있습니다",
                        "code", "INVALID_NICKNAME_PATTERN"
                    ));
                }
                
                // 닉네임 중복 검사 (현재 사용자 제외)
                Optional<User> existingUser = userRepository.findByNickname(newNickname.trim());
                if (existingUser.isPresent() && !existingUser.get().getUserIdx().equals(userId)) {
                    return ResponseEntity.status(409).body(Map.of(
                        "success", false,
                        "error", "이미 사용 중인 닉네임입니다",
                        "code", "DUPLICATE_NICKNAME"
                    ));
                }
                
                user.setNickname(newNickname.trim());
                updated = true;
                log.info("닉네임 업데이트: {} -> {}", user.getNickname(), newNickname);
            }
            
            // 프로필 이미지 업데이트
            if (updateRequest.containsKey("profileImage")) {
                String newProfileImage = (String) updateRequest.get("profileImage");
                user.setProfileImage(newProfileImage);
                updated = true;
                log.info("프로필 이미지 업데이트: userId={}", userId);
            }
            
            if (!updated) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "업데이트할 필드가 없습니다",
                    "code", "NO_UPDATE_FIELDS"
                ));
            }
            
            // 사용자 정보 저장
            User savedUser = userRepository.save(user);
            
            // 응답 데이터 구성
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("userIdx", savedUser.getUserIdx().toString());
            userProfile.put("email", savedUser.getEmail());
            userProfile.put("nickname", savedUser.getNickname());
            userProfile.put("profileImage", savedUser.getProfileImage());
            userProfile.put("role", savedUser.getRole().name());
            userProfile.put("createdAt", savedUser.getCreatedAt());
            userProfile.put("updatedAt", savedUser.getUpdatedAt());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "프로필이 성공적으로 업데이트되었습니다");
            response.put("user", userProfile);
            
            log.info("프로필 업데이트 완료: userId={}", userId);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("프로필 업데이트 실패 - 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "INVALID_REQUEST"
            ));
        } catch (Exception e) {
            log.error("프로필 업데이트 실패: ", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "프로필 업데이트 중 오류가 발생했습니다",
                "code", "INTERNAL_ERROR"
            ));
        }
    }
} 