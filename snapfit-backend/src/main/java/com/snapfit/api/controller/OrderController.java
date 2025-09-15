package com.snapfit.api.controller;

import com.snapfit.api.dto.OrderRequestDto;
import com.snapfit.api.dto.OrderResponseDto;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    
    private final OrderService orderService;
    private final UserRepository userRepository;
    
    // 주문 생성
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody OrderRequestDto requestDto) {
        
        if (userDetails == null) {
            log.warn("인증되지 않은 사용자의 주문 생성 시도");
            return ResponseEntity.status(401).body(null);
        }
        
        User user = userDetails.getUser();
        log.info("주문 생성 요청: userId={}, email={}", user.getUserIdx(), user.getEmail());
        
        OrderResponseDto response = orderService.createOrder(user.getUserIdx(), requestDto);
        return ResponseEntity.ok(response);
    }
    
    // 주문 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(@PathVariable UUID orderId) {
        log.info("주문 조회 요청: orderId={}", orderId);
        
        OrderResponseDto response = orderService.getOrder(orderId);
        return ResponseEntity.ok(response);
    }
    
    // 사용자 주문 목록 조회
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getUserOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        if (userDetails == null) {
            log.warn("인증되지 않은 사용자의 주문 목록 조회 시도");
            return ResponseEntity.status(401).body(null);
        }
        
        User user = userDetails.getUser();
        log.info("사용자 주문 목록 조회 요청: userId={}, email={}", user.getUserIdx(), user.getEmail());
        
        List<OrderResponseDto> response = orderService.getUserOrders(user.getUserIdx());
        return ResponseEntity.ok(response);
    }
    
    // 결제 완료 처리
    @PostMapping("/{orderNumber}/complete")
    public ResponseEntity<OrderResponseDto> completePayment(
            @PathVariable String orderNumber,
            @RequestParam String paymentId) {
        
        log.info("결제 완료 처리 요청: orderNumber={}, paymentId={}", orderNumber, paymentId);
        
        OrderResponseDto response = orderService.completePayment(paymentId, orderNumber);
        return ResponseEntity.ok(response);
    }
}
