package com.snapfit.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDto {
    
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private List<OrderItemRequestDto> items;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequestDto {
        private Long productId;
        private Integer quantity;
        private Integer price;
    }
}
