package com.snapfit.api.repository;

import com.snapfit.api.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<Media, Long> {
    Media findByMediaUidName(String mediaUidName);
}