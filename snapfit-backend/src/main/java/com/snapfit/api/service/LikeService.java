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
import com.snapfit.api.repository.PostRepository;
import com.snapfit.api.repository.UserRepository;

/**
 * 좋아요 기능 서비스.
 */
@Service
public class LikeService {
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Autowired
    public LikeService(LikeRepository likeRepository, PostRepository postRepository, 
                      NotificationService notificationService, UserRepository userRepository) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
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
        
        Like savedLike = likeRepository.save(like);
        
        // 좋아요 알림 생성 (자신의 게시글이 아닌 경우에만)
        if (targetType == TargetType.OUTFIT_SHARE) {
            createLikeNotification(user, targetIdx, savedLike);
        }
        
        return savedLike;
    }

    /**
     * 좋아요/취소 토글.
     */
    @Transactional
    public boolean toggleLike(User user, Long targetIdx, TargetType targetType) {
        Optional<Like> existing = likeRepository.findByUserAndTargetIdxAndTargetType(user, targetIdx, targetType);
        if (existing.isPresent()) {
            // 좋아요 취소
            likeRepository.delete(existing.get());
            
            // POST 타입인 경우 Post의 likeCount 감소
            if (targetType == TargetType.OUTFIT_SHARE) {
                postRepository.decrementLikeCount(targetIdx);
            }
            
            return false; // 취소됨
        } else {
            // 좋아요 등록
            Like like = Like.builder()
                    .user(user)
                    .targetIdx(targetIdx)
                    .targetType(targetType)
                    .isLike(true)
                    .build();
            likeRepository.save(like);
            
            // POST 타입인 경우 Post의 likeCount 증가
            if (targetType == TargetType.OUTFIT_SHARE) {
                postRepository.incrementLikeCount(targetIdx);
            }
            
            // 좋아요 알림 생성 (자신의 게시글이 아닌 경우에만)
            if (targetType == TargetType.OUTFIT_SHARE) {
                createLikeNotification(user, targetIdx, like);
            }
            
            return true; // 좋아요 등록
        }
    }

    /**
     * 좋아요 알림 생성
     */
    private void createLikeNotification(User liker, Long postIdx, Like like) {
        try {
            // 게시글 작성자 조회
            Optional<com.snapfit.api.entity.Post> postOpt = postRepository.findById(postIdx);
            if (postOpt.isPresent()) {
                com.snapfit.api.entity.Post post = postOpt.get();
                User postAuthor = post.getAuthor();
                
                // 자신의 게시글에 좋아요를 누른 경우 알림 생성하지 않음
                if (postAuthor.getUserIdx().equals(liker.getUserIdx())) {
                    return;
                }
                
                // 알림 생성
                notificationService.createNotification(
                    postAuthor.getUserIdx(),
                    "LIKE",
                    liker.getUserIdx(),
                    postIdx,
                    "LIKE_POST",
                    String.format("%s님이 회원님의 게시글을 좋아합니다.", liker.getNickname())
                );
            }
        } catch (Exception e) {
            // 알림 생성 실패는 좋아요 기능에 영향을 주지 않도록 로그만 남김
            System.err.println("좋아요 알림 생성 실패: " + e.getMessage());
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