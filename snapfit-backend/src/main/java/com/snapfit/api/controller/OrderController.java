package com.snapfit.api.controller;

import com.snapfit.api.dto.OrderRequestDto;
import com.snapfit.api.dto.OrderResponseDto;
import com.snapfit.api.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    
    private final OrderService orderService;
    
    // 주문 생성
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestBody OrderRequestDto requestDto) {
        
        log.info("주문 생성 요청: userId={}", userIdStr);
        
        // 기본 사용자 ID 설정 (인증이 없는 경우)
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        if (userIdStr != null && !userIdStr.isEmpty()) {
            try {
                userId = UUID.fromString(userIdStr);
            } catch (IllegalArgumentException e) {
                log.warn("잘못된 사용자 ID 형식: {}, 기본값 사용", userIdStr);
            }
        }
        
        OrderResponseDto response = orderService.createOrder(userId, requestDto);
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
            @RequestHeader("X-User-Id") String userIdStr) {
        
        log.info("사용자 주문 목록 조회 요청: userId={}", userIdStr);
        
        // 기본 사용자 ID 설정 (인증이 없는 경우)
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        if (userIdStr != null && !userIdStr.isEmpty()) {
            try {
                userId = UUID.fromString(userIdStr);
            } catch (IllegalArgumentException e) {
                log.warn("잘못된 사용자 ID 형식: {}, 기본값 사용", userIdStr);
            }
        }
        
        List<OrderResponseDto> response = orderService.getUserOrders(userId);
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
