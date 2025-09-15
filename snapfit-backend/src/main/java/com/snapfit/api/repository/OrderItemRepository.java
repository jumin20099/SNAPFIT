package com.snapfit.api.repository;

import com.snapfit.api.entity.Order;
import com.snapfit.api.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    
    // 주문별 주문 아이템 조회
    List<OrderItem> findByOrderOrderByCreatedAtAsc(Order order);
    
    // 주문 ID로 주문 아이템 조회
    List<OrderItem> findByOrderOrderIdOrderByCreatedAtAsc(UUID orderId);
}
