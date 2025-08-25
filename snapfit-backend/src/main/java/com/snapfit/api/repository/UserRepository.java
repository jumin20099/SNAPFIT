package com.snapfit.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snapfit.api.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {

    /** 기존 소셜 로그인에서 provider+ID 조회용 */
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    /** 이메일 중복 검사용 */
    Optional<User> findByEmail(String email);
    
    /** userIdx로 사용자 찾기 */
    Optional<User> findByUserIdx(UUID userIdx);
    
    /** 닉네임 중복 검사용 */
    Optional<User> findByNickname(String nickname);
}
