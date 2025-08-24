package com.snapfit.api.service;

import com.snapfit.api.entity.Block;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.BlockRepository;
import com.snapfit.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 차단 서비스
 * 
 * @author SnapFit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlockService {

    private final BlockRepository blockRepository;
    private final UserRepository userRepository;

    /**
     * 사용자 차단
     */
    @Transactional
    public void blockUser(UUID blockerId, UUID blockedUserId, String reason) {
        log.info("사용자 차단 시작: 차단자={}, 차단대상={}", blockerId, blockedUserId);
        
        // 자기 자신 차단 방지
        if (blockerId.equals(blockedUserId)) {
            throw new IllegalArgumentException("자기 자신을 차단할 수 없습니다");
        }
        
        // 이미 차단된 사용자인지 확인
        if (blockRepository.existsByBlockerIdAndBlockedUserId(blockerId, blockedUserId)) {
            log.warn("이미 차단된 사용자: 차단자={}, 차단대상={}", blockerId, blockedUserId);
            return; // 중복 차단 허용하지 않음
        }
        
        // 사용자 존재 확인
        User blocker = userRepository.findById(blockerId)
            .orElseThrow(() -> new IllegalArgumentException("차단하는 사용자를 찾을 수 없습니다"));
        User blockedUser = userRepository.findById(blockedUserId)
            .orElseThrow(() -> new IllegalArgumentException("차단할 사용자를 찾을 수 없습니다"));
        
        // 차단 생성
        Block block = Block.builder()
            .blockerId(blockerId)
            .blockedUserId(blockedUserId)
            .reason(reason)
            .build();
        
        blockRepository.save(block);
        
        log.info("사용자 차단 완료: 차단자={}, 차단대상={}", blockerId, blockedUserId);
    }

    /**
     * 사용자 차단 해제
     */
    @Transactional
    public void unblockUser(UUID blockerId, UUID blockedUserId) {
        log.info("사용자 차단 해제 시작: 차단자={}, 차단대상={}", blockerId, blockedUserId);
        
        if (!blockRepository.existsByBlockerIdAndBlockedUserId(blockerId, blockedUserId)) {
            throw new IllegalArgumentException("차단 관계가 존재하지 않습니다");
        }
        
        blockRepository.deleteByBlockerIdAndBlockedUserId(blockerId, blockedUserId);
        
        log.info("사용자 차단 해제 완료: 차단자={}, 차단대상={}", blockerId, blockedUserId);
    }

    /**
     * 차단 상태 확인
     */
    public boolean isBlocked(UUID blockerId, UUID blockedUserId) {
        return blockRepository.existsByBlockerIdAndBlockedUserId(blockerId, blockedUserId);
    }

    /**
     * 특정 사용자가 차단한 사용자 목록
     */
    public List<Block> getBlockedUsers(UUID blockerId) {
        return blockRepository.findByBlockerId(blockerId);
    }

    /**
     * 특정 사용자가 차단한 사용자 목록 (페이징)
     */
    public Page<Block> getBlockedUsers(UUID blockerId, Pageable pageable) {
        return blockRepository.findByBlockerIdOrderByCreatedAtDesc(blockerId, pageable);
    }

    /**
     * 특정 사용자가 차단한 사용자 ID 목록
     */
    public List<UUID> getBlockedUserIds(UUID blockerId) {
        return blockRepository.findBlockedUserIdsByBlockerId(blockerId);
    }

    /**
     * 차단된 사용자 수
     */
    public long getBlockedUserCount(UUID blockerId) {
        return blockRepository.countByBlockerId(blockerId);
    }

    /**
     * 특정 사용자를 차단한 사용자 수
     */
    public long getBlockerCount(UUID blockedUserId) {
        return blockRepository.countByBlockedUserId(blockedUserId);
    }

    /**
     * 서로 차단 여부 확인
     */
    public boolean hasMutualBlock(UUID userId1, UUID userId2) {
        return blockRepository.existsMutualBlock(userId1, userId2);
    }

    /**
     * 주어진 사용자 목록에서 차단된 사용자들 필터링
     */
    public List<UUID> filterBlockedUsers(UUID currentUserId, List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return userIds;
        }
        
        List<UUID> blockedIds = blockRepository.findBlockedUserIdsInList(currentUserId, userIds);
        return userIds.stream()
            .filter(id -> !blockedIds.contains(id))
            .toList();
    }

    /**
     * 차단 관계로 인해 접근이 제한되는지 확인
     */
    public boolean isAccessRestricted(UUID currentUserId, UUID targetUserId) {
        // 현재 사용자가 대상 사용자를 차단했거나, 대상 사용자가 현재 사용자를 차단한 경우
        return isBlocked(currentUserId, targetUserId) || isBlocked(targetUserId, currentUserId);
    }
}
