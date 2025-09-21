package com.snapfit.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.snapfit.api.entity.Follow;
import com.snapfit.api.entity.FollowId;
import com.snapfit.api.entity.User;

@Repository
public interface FollowRepository extends JpaRepository<Follow, FollowId> {
    
    // 팔로우 관계 확인
    Optional<Follow> findByFollowerAndFollowee(User follower, User followee);
    
    // 팔로우 여부 확인
    boolean existsByFollowerAndFollowee(User follower, User followee);
    
    // 팔로워 수 조회
    long countByFollowee(User followee);
    
    // 팔로잉 수 조회
    long countByFollower(User follower);
    
    // 팔로워 목록 조회
    @Query("SELECT f.follower FROM Follow f WHERE f.followee = :user")
    List<User> findFollowersByUser(@Param("user") User user);
    
    // 팔로잉 목록 조회
    @Query("SELECT f.followee FROM Follow f WHERE f.follower = :user")
    List<User> findFollowingByUser(@Param("user") User user);
}