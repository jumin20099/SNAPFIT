package com.snapfit.api.service;

import com.snapfit.api.dto.cart.CartItemRequestDto;
import com.snapfit.api.dto.cart.CartItemResponseDto;
import com.snapfit.api.entity.CartItem;
import com.snapfit.api.entity.Product;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.CartItemRepository;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    // 장바구니에 상품 추가
    @Transactional
    public CartItemResponseDto addToCart(UUID userId, CartItemRequestDto requestDto) {
        log.info("장바구니에 상품 추가 요청: userId={}, productId={}, quantity={}", 
                userId, requestDto.getProductId(), requestDto.getQuantity());
        
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 상품 조회
        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
        
        // 기존 장바구니 아이템 확인
        Optional<CartItem> existingItem = cartItemRepository.findByUserAndProduct(user, product);
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            // 기존 아이템이 있으면 수량 증가
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + requestDto.getQuantity());
            log.info("기존 장바구니 아이템 수량 증가: {}", cartItem.getQuantity());
        } else {
            // 새 아이템 생성
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(requestDto.getQuantity())
                    .build();
            log.info("새 장바구니 아이템 생성");
        }
        
        CartItem savedItem = cartItemRepository.save(cartItem);
        log.info("장바구니 아이템 저장 완료: id={}", savedItem.getId());
        
        return convertToResponseDto(savedItem);
    }
    
    // 사용자의 장바구니 조회
    public List<CartItemResponseDto> getCartItems(UUID userId) {
        log.info("장바구니 조회 요청: userId={}", userId);
        
        List<CartItem> cartItems = cartItemRepository.findByUserIdWithProduct(userId);
        log.info("장바구니 아이템 개수: {}", cartItems.size());
        
        return cartItems.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }
    
    // 장바구니 아이템 수량 수정
    @Transactional
    public CartItemResponseDto updateQuantity(UUID userId, Long cartItemId, Integer quantity) {
        log.info("장바구니 아이템 수량 수정: userId={}, cartItemId={}, quantity={}", 
                userId, cartItemId, quantity);
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("장바구니 아이템을 찾을 수 없습니다."));
        
        // 권한 확인
        if (!cartItem.getUser().getUserIdx().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }
        
        cartItem.setQuantity(quantity);
        CartItem savedItem = cartItemRepository.save(cartItem);
        
        return convertToResponseDto(savedItem);
    }
    
    // 장바구니 아이템 삭제
    @Transactional
    public void removeFromCart(UUID userId, Long cartItemId) {
        log.info("장바구니 아이템 삭제: userId={}, cartItemId={}", userId, cartItemId);
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("장바구니 아이템을 찾을 수 없습니다."));
        
        // 권한 확인
        if (!cartItem.getUser().getUserIdx().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }
        
        cartItemRepository.delete(cartItem);
        log.info("장바구니 아이템 삭제 완료");
    }
    
    // 장바구니 전체 비우기
    @Transactional
    public void clearCart(UUID userId) {
        log.info("장바구니 전체 비우기: userId={}", userId);
        cartItemRepository.deleteByUserUserIdx(userId);
        log.info("장바구니 전체 비우기 완료");
    }
    
    // 장바구니 아이템 개수 조회
    public long getCartItemCount(UUID userId) {
        return cartItemRepository.countByUserUserIdx(userId);
    }
    
    // Entity를 ResponseDto로 변환
    private CartItemResponseDto convertToResponseDto(CartItem cartItem) {
        Product product = cartItem.getProduct();
        Integer totalPrice = product.getProductPrice() * cartItem.getQuantity();
        
        return CartItemResponseDto.builder()
                .id(cartItem.getId())
                .productId(product.getProductIdx())
                .productName(product.getProductName())
                .productImage(product.getProductImage())
                .productPrice(product.getProductPrice())
                .quantity(cartItem.getQuantity())
                .totalPrice(totalPrice)
                .createdAt(cartItem.getCreatedAt())
                .updatedAt(cartItem.getUpdatedAt())
                .build();
    }
}
