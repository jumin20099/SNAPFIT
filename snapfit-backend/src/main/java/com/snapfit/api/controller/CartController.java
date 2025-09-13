package com.snapfit.api.controller;

import com.snapfit.api.dto.cart.CartItemRequestDto;
import com.snapfit.api.dto.cart.CartItemResponseDto;
import com.snapfit.api.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {
    
    private final CartService cartService;
    
    // 장바구니에 상품 추가
    @PostMapping("/items")
    public ResponseEntity<CartItemResponseDto> addToCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody CartItemRequestDto requestDto) {
        
        // 사용자 ID가 없으면 기본값 1 사용 (임시)
        if (userId == null) {
            userId = 1L;
        }
        
        log.info("장바구니 추가 요청: userId={}, productId={}, quantity={}", 
                userId, requestDto.getProductId(), requestDto.getQuantity());
        
        try {
            CartItemResponseDto response = cartService.addToCart(userId, requestDto);
            log.info("장바구니 추가 성공: cartItemId={}", response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("장바구니 추가 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 장바구니 조회
    @GetMapping("/items")
    public ResponseEntity<List<CartItemResponseDto>> getCartItems(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // 사용자 ID가 없으면 기본값 1 사용 (임시)
        if (userId == null) {
            userId = 1L;
        }
        
        log.info("장바구니 조회 요청: userId={}", userId);
        
        try {
            List<CartItemResponseDto> cartItems = cartService.getCartItems(userId);
            log.info("장바구니 조회 성공: itemCount={}", cartItems.size());
            return ResponseEntity.ok(cartItems);
        } catch (Exception e) {
            log.error("장바구니 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 장바구니 아이템 수량 수정
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartItemResponseDto> updateQuantity(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        
        // 사용자 ID가 없으면 기본값 1 사용 (임시)
        if (userId == null) {
            userId = 1L;
        }
        
        log.info("장바구니 수량 수정 요청: userId={}, cartItemId={}, quantity={}", 
                userId, cartItemId, quantity);
        
        try {
            CartItemResponseDto response = cartService.updateQuantity(userId, cartItemId, quantity);
            log.info("장바구니 수량 수정 성공: cartItemId={}", response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("장바구니 수량 수정 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 장바구니 아이템 삭제
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long cartItemId) {
        
        // 사용자 ID가 없으면 기본값 1 사용 (임시)
        if (userId == null) {
            userId = 1L;
        }
        
        log.info("장바구니 아이템 삭제 요청: userId={}, cartItemId={}", userId, cartItemId);
        
        try {
            cartService.removeFromCart(userId, cartItemId);
            log.info("장바구니 아이템 삭제 성공");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("장바구니 아이템 삭제 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 장바구니 전체 비우기
    @DeleteMapping("/items")
    public ResponseEntity<Void> clearCart(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // 사용자 ID가 없으면 기본값 1 사용 (임시)
        if (userId == null) {
            userId = 1L;
        }
        log.info("장바구니 전체 비우기 요청: userId={}", userId);
        
        try {
            cartService.clearCart(userId);
            log.info("장바구니 전체 비우기 성공");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("장바구니 전체 비우기 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 장바구니 아이템 개수 조회
    @GetMapping("/count")
    public ResponseEntity<Long> getCartItemCount(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // 사용자 ID가 없으면 기본값 1 사용 (임시)
        if (userId == null) {
            userId = 1L;
        }
        log.info("장바구니 아이템 개수 조회: userId={}", userId);
        
        try {
            long count = cartService.getCartItemCount(userId);
            log.info("장바구니 아이템 개수: {}", count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("장바구니 아이템 개수 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
