package com.snapfit.api.service;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.User;
import com.snapfit.api.entity.Like.TargetType;
import com.snapfit.api.repository.LikeRepository;

/**
 * 좋아요 기능 서비스.
 */
@Service
public class LikeService {
    private final LikeRepository likeRepository;

    @Autowired
    public LikeService(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    /**
     * 좋아요를 등록한다. 이미 존재하면 아무 동작 하지 않는다.
     */
    @Transactional
    public Like createLike(User user, Long targetIdx, TargetType targetType) {
        Optional<Like> existing = likeRepository.findByUserAndTargetIdxAndTargetType(user, targetIdx, targetType);
        if (existing.isPresent()) {
            return existing.get();
        }
        Like like = Like.builder()
                .user(user)
                .targetIdx(targetIdx)
                .targetType(targetType)
                .isLike(true)
                .build();
        return likeRepository.save(like);
    }

    /**
     * 좋아요/취소 토글.
     */
    @Transactional
    public boolean toggleLike(User user, Long targetIdx, TargetType targetType) {
        Optional<Like> existing = likeRepository.findByUserAndTargetIdxAndTargetType(user, targetIdx, targetType);
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            return false; // 취소됨
        } else {
            Like like = Like.builder()
                    .user(user)
                    .targetIdx(targetIdx)
                    .targetType(targetType)
                    .isLike(true)
                    .build();
            likeRepository.save(like);
            return true; // 좋아요 등록
        }
    }

    /** 특정 대상의 좋아요 개수 반환 */
    @Transactional(readOnly = true)
    public Long countLikes(Long targetIdx, TargetType targetType) {
        return likeRepository.countByTargetIdxAndTargetTypeAndIsLikeTrue(targetIdx, targetType);
    }

    /** 사용자 좋아요 목록 */
    @Transactional(readOnly = true)
    public List<Like> listUserLikes(User user) {
        return likeRepository.findByUserAndIsLikeTrue(user);
    }
} 