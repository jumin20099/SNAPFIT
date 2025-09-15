package com.snapfit.api.repository;

import com.snapfit.api.entity.Order;
import com.snapfit.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    // 사용자의 주문 목록 조회
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    // 주문 번호로 조회
    Optional<Order> findByOrderNumber(String orderNumber);
    
    // 결제 ID로 조회
    Optional<Order> findByPaymentId(String paymentId);
    
    // 사용자 ID로 주문 목록 조회 (페이징 없이)
    @Query("SELECT o FROM Order o WHERE o.user.userIdx = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
}
