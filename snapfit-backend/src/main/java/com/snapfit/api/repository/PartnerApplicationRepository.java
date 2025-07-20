package com.snapfit.api.repository;

import com.snapfit.api.entity.PartnerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PartnerApplicationRepository extends JpaRepository<PartnerApplication, Long> {
    
    // 사용자별 신청 조회 (현재는 단순화하여 첫 번째 신청만 조회)
    Optional<PartnerApplication> findFirstByOrderByCreatedAtDesc();
    
    // 이메일로 신청 조회
    Optional<PartnerApplication> findByContactEmail(String contactEmail);
    
    // 어드민용 전체 신청 목록 조회
    List<PartnerApplication> findAllByOrderByCreatedAtDesc();
    
    // 상태별 신청 목록 조회
    List<PartnerApplication> findByStatusOrderByCreatedAtDesc(PartnerApplication.ApplicationStatus status);
} 