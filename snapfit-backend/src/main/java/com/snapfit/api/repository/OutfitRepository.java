package com.snapfit.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;

import java.util.List;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, Long> {
    /** 공개 코디 목록 최신순 조회 */
    List<Outfit> findByIsPublicTrueOrderByCreatedAtDesc();
    
    /** 특정 사용자의 코디 목록 최신순 조회 */
    List<Outfit> findByUserOrderByCreatedAtDesc(User user);
} 