package com.snapfit.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.Like.TargetType;
import com.snapfit.api.entity.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserAndTargetIdxAndTargetType(User user, Long targetIdx, TargetType targetType);

    Long countByTargetIdxAndTargetTypeAndIsLikeTrue(Long targetIdx, TargetType targetType);

    List<Like> findByUserAndIsLikeTrue(User user);
} 