package com.snapfit.api.service;

import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.LikeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LikeServiceTest {

    @Mock LikeRepository likeRepository;
    @InjectMocks LikeService likeService;

    @Test
    void createLike_returns_existing_if_present() {
        User user = User.builder().userIdx(UUID.randomUUID()).email("a@a.com").provider("kakao").providerId("1").build();
        Like existing = Like.builder().likeIdx(1L).user(user).targetIdx(10L).targetType(Like.TargetType.PRODUCT).build();
        when(likeRepository.findByUserAndTargetIdxAndTargetType(user, 10L, Like.TargetType.PRODUCT))
                .thenReturn(Optional.of(existing));

        Like result = likeService.createLike(user, 10L, Like.TargetType.PRODUCT);

        assertThat(result).isEqualTo(existing);
        verify(likeRepository, never()).save(any());
    }

    @Test
    void toggleLike_when_not_liked_creates_like() {
        User user = User.builder().userIdx(UUID.randomUUID()).email("b@b.com").provider("kakao").providerId("1").build();
        when(likeRepository.findByUserAndTargetIdxAndTargetType(user, 20L, Like.TargetType.PRODUCT))
                .thenReturn(Optional.empty());

        boolean liked = likeService.toggleLike(user, 20L, Like.TargetType.PRODUCT);

        assertThat(liked).isTrue();
        verify(likeRepository).save(any(Like.class));
    }

    @Test
    void toggleLike_when_already_liked_removes_like() {
        User user = User.builder().userIdx(UUID.randomUUID()).email("c@c.com").provider("kakao").providerId("1").build();
        Like existing = Like.builder().likeIdx(2L).user(user).targetIdx(30L).targetType(Like.TargetType.PRODUCT).build();
        when(likeRepository.findByUserAndTargetIdxAndTargetType(user, 30L, Like.TargetType.PRODUCT))
                .thenReturn(Optional.of(existing));

        boolean liked = likeService.toggleLike(user, 30L, Like.TargetType.PRODUCT);

        assertThat(liked).isFalse();
        verify(likeRepository).delete(existing);
    }
} 