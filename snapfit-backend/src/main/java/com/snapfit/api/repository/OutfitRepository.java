package com.snapfit.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapfit.api.entity.Outfit;

import java.util.List;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, Long> {
    /** 공개 코디 목록 최신순 조회 */
    List<Outfit> findByIsPublicTrueOrderByCreatedAtDesc();
} 