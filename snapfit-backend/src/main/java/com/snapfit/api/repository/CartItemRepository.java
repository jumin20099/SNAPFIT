package com.snapfit.api.repository;

import com.snapfit.api.entity.CartItem;
import com.snapfit.api.entity.Product;
import com.snapfit.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // 사용자의 모든 장바구니 아이템 조회
    @Query("SELECT ci FROM CartItem ci " +
           "JOIN FETCH ci.product p " +
           "WHERE ci.user.userIdx = :userId " +
           "ORDER BY ci.createdAt DESC")
    List<CartItem> findByUserIdWithProduct(@Param("userId") UUID userId);
    
    // 특정 사용자와 상품의 장바구니 아이템 조회
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    
    // 사용자의 장바구니 아이템 개수
    long countByUserUserIdx(UUID userId);
    
    // 사용자의 장바구니 전체 삭제
    void deleteByUserUserIdx(UUID userId);
}
