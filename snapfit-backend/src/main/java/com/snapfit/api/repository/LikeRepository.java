package com.snapfit.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.Like.TargetType;
import com.snapfit.api.entity.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserAndTargetIdxAndTargetType(User user, Long targetIdx, TargetType targetType);
} 