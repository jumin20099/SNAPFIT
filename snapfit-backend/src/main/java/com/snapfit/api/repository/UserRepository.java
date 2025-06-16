// src/main/java/com/snapfit/api/repository/UserRepository.java
package com.snapfit.api.repository;

import com.snapfit.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
}
