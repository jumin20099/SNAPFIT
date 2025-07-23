package com.snapfit.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapfit.api.entity.Outfit;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, Long> {
} 