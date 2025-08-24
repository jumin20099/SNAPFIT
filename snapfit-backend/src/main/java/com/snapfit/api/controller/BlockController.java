package com.snapfit.api.controller;

import com.snapfit.api.entity.Block;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.service.BlockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 차단 시스템 컨트롤러
 * 
 * @author SnapFit Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;
    private final UserRepository userRepository;

    /**
     * 사용자 차단
     */
    @PostMapping("/{userId}")
    public ResponseEntity<?> blockUser(@PathVariable String userId, 
                                     @RequestParam(required = false) String reason,
                                     @RequestParam(required = false) String token) {
        log.info("사용자 차단 요청: 대상사용자={}", userId);
        
        try {
            // 임시 인증 우회 (테스트용)
            String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7"; // 김주민
            log.info("차단 API 호출됨 - 임시 인증 우회");
            
            UUID blockerUuid = UUID.fromString(currentUserId);
            UUID blockedUuid = UUID.fromString(userId);
            
            // 이미 차단된 사용자인지 확인
            if (blockService.isBlocked(blockerUuid, blockedUuid)) {
                // 이미 차단된 경우에도 성공 응답 (중복 차단 허용)
                User blockedUser = userRepository.findById(blockedUuid)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
                
                Map<String, Object> response = new HashMap<>();
                response.put("blocked", true);
                response.put("blockedUserId", blockedUuid.toString());
                response.put("blockedUserNickname", blockedUser.getNickname());
                response.put("message", "이미 차단된 사용자입니다");
                
                return ResponseEntity.ok(response);
            }
            
            // 새로운 차단 생성
            blockService.blockUser(blockerUuid, blockedUuid, reason);
            
            // 차단된 사용자 정보 조회
            User blockedUser = userRepository.findById(blockedUuid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("blocked", true);
            response.put("blockedUserId", blockedUuid.toString());
            response.put("blockedUserNickname", blockedUser.getNickname());
            response.put("message", "사용자를 차단했습니다");
            
            log.info("사용자 차단 성공: 차단자={}, 차단대상={}", currentUserId, userId);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("사용자 차단 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("사용자 차단 오류: 대상사용자={}, 오류={}", userId, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "차단 처리 중 오류가 발생했습니다"));
        }
    }

    /**
     * 차단 해제
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> unblockUser(@PathVariable String userId,
                                       @RequestParam(required = false) String token) {
        log.info("차단 해제 요청: 대상사용자={}", userId);
        
        try {
            // 임시 인증 우회 (테스트용)
            String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7"; // 김주민
            
            UUID blockerUuid = UUID.fromString(currentUserId);
            UUID blockedUuid = UUID.fromString(userId);
            
            blockService.unblockUser(blockerUuid, blockedUuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("blocked", false);
            response.put("message", "차단을 해제했습니다");
            
            log.info("차단 해제 성공: 차단자={}, 차단대상={}", currentUserId, userId);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("차단 해제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("차단 해제 오류: 대상사용자={}, 오류={}", userId, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "차단 해제 처리 중 오류가 발생했습니다"));
        }
    }

    /**
     * 차단 상태 확인
     */
    @GetMapping("/check/{userId}")
    public ResponseEntity<?> checkBlockStatus(@PathVariable String userId,
                                            @RequestParam(required = false) String token) {
        try {
            // 임시 인증 우회 (테스트용)
            String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7"; // 김주민
            
            UUID blockerUuid = UUID.fromString(currentUserId);
            UUID blockedUuid = UUID.fromString(userId);
            
            boolean isBlocked = blockService.isBlocked(blockerUuid, blockedUuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isBlocked", isBlocked);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("차단 상태 확인 오류: 대상사용자={}, 오류={}", userId, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "차단 상태 확인 중 오류가 발생했습니다"));
        }
    }

    /**
     * 내 차단 목록 조회
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyBlockedUsers(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size,
                                             @RequestParam(required = false) String token) {
        try {
            // 임시 인증 우회 (테스트용)
            String currentUserId = "87b18a9c-d2ba-4318-b9aa-859e03c5aad7"; // 김주민
            
            UUID blockerUuid = UUID.fromString(currentUserId);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Block> blockedUsers = blockService.getBlockedUsers(blockerUuid, pageable);
            
            // 응답 데이터 변환
            List<Map<String, Object>> blockList = blockedUsers.getContent().stream()
                .map(block -> {
                    Map<String, Object> blockInfo = new HashMap<>();
                    blockInfo.put("blockedUserId", block.getBlockedUserId().toString());
                    
                    // 차단된 사용자 정보 조회
                    userRepository.findById(block.getBlockedUserId())
                        .ifPresent(user -> blockInfo.put("blockedUserNickname", user.getNickname()));
                    
                    blockInfo.put("reason", block.getReason());
                    blockInfo.put("createdAt", block.getCreatedAt());
                    
                    return blockInfo;
                })
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", blockList);
            response.put("totalElements", blockedUsers.getTotalElements());
            response.put("totalPages", blockedUsers.getTotalPages());
            response.put("size", blockedUsers.getSize());
            response.put("number", blockedUsers.getNumber());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("차단 목록 조회 오류: 오류={}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "차단 목록 조회 중 오류가 발생했습니다"));
        }
    }
}
