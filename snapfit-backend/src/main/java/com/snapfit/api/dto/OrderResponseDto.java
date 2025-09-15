package com.snapfit.api.dto;

import com.snapfit.api.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    
    private UUID orderId;
    private String orderNumber;
    private UUID userId;
    private Integer totalAmount;
    private Order.OrderStatus status;
    private String paymentId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDto> orderItems;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponseDto {
        private UUID orderItemId;
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Integer price;
    }
}
