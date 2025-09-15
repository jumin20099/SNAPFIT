package com.snapfit.api.service;

import com.snapfit.api.dto.OrderRequestDto;
import com.snapfit.api.dto.OrderResponseDto;
import com.snapfit.api.entity.*;
import com.snapfit.api.repository.OrderItemRepository;
import com.snapfit.api.repository.OrderRepository;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    // 주문 생성
    @Transactional
    public OrderResponseDto createOrder(UUID userId, OrderRequestDto requestDto) {
        log.info("주문 생성 시작: userId={}, customerName={}", userId, requestDto.getCustomerName());
        
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        // 주문 번호 생성 (YYYYMMDDHHMMSS + 랜덤 4자리)
        String orderNumber = generateOrderNumber();
        
        // 주문 생성
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .totalAmount(calculateTotalAmount(requestDto.getItems()))
                .status(Order.OrderStatus.PENDING)
                .customerName(requestDto.getCustomerName())
                .customerEmail(requestDto.getCustomerEmail())
                .customerPhone(requestDto.getCustomerPhone())
                .build();
        
        order = orderRepository.save(order);
        log.info("주문 생성 완료: orderId={}, orderNumber={}", order.getOrderId(), order.getOrderNumber());
        
        // 주문 아이템 생성
        List<OrderItem> orderItems = createOrderItems(order, requestDto.getItems());
        orderItemRepository.saveAll(orderItems);
        
        log.info("주문 아이템 생성 완료: {}개", orderItems.size());
        
        return convertToResponseDto(order, orderItems);
    }
    
    // 주문 조회
    public OrderResponseDto getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다: " + orderId));
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderIdOrderByCreatedAtAsc(orderId);
        
        return convertToResponseDto(order, orderItems);
    }
    
    // 사용자 주문 목록 조회
    public List<OrderResponseDto> getUserOrders(UUID userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return orders.stream()
                .map(order -> {
                    List<OrderItem> orderItems = orderItemRepository.findByOrderOrderIdOrderByCreatedAtAsc(order.getOrderId());
                    return convertToResponseDto(order, orderItems);
                })
                .collect(Collectors.toList());
    }
    
    // 결제 완료 처리
    @Transactional
    public OrderResponseDto completePayment(String paymentId, String orderNumber) {
        log.info("결제 완료 처리: paymentId={}, orderNumber={}", paymentId, orderNumber);
        
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다: " + orderNumber));
        
        order.setPaymentId(paymentId);
        order.setStatus(Order.OrderStatus.PAID);
        
        order = orderRepository.save(order);
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderIdOrderByCreatedAtAsc(order.getOrderId());
        
        log.info("결제 완료 처리 완료: orderId={}", order.getOrderId());
        
        return convertToResponseDto(order, orderItems);
    }
    
    // 주문 아이템 생성
    private List<OrderItem> createOrderItems(Order order, List<OrderRequestDto.OrderItemRequestDto> itemDtos) {
        return itemDtos.stream()
                .map(itemDto -> {
                    Product product = productRepository.findById(itemDto.getProductId())
                            .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다: " + itemDto.getProductId()));
                    
                    return OrderItem.builder()
                            .order(order)
                            .product(product)
                            .quantity(itemDto.getQuantity())
                            .price(itemDto.getPrice())
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    // 총 금액 계산
    private Integer calculateTotalAmount(List<OrderRequestDto.OrderItemRequestDto> items) {
        return items.stream()
                .mapToInt(item -> item.getQuantity() * item.getPrice())
                .sum();
    }
    
    // 주문 번호 생성
    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%04d", (int) (Math.random() * 10000));
        return "ORD" + timestamp + random;
    }
    
    // Entity를 ResponseDto로 변환
    private OrderResponseDto convertToResponseDto(Order order, List<OrderItem> orderItems) {
        List<OrderResponseDto.OrderItemResponseDto> itemDtos = orderItems.stream()
                .map(item -> OrderResponseDto.OrderItemResponseDto.builder()
                        .orderItemId(item.getOrderItemId())
                        .productId(item.getProduct().getProductIdx())
                        .productName(item.getProduct().getProductName())
                        .productImage(item.getProduct().getProductImage())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());
        
        return OrderResponseDto.builder()
                .orderId(order.getOrderId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getUserIdx())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentId(order.getPaymentId())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .createdAt(order.getCreatedAt())
                .orderItems(itemDtos)
                .build();
    }
}
