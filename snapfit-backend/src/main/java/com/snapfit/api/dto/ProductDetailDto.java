package com.snapfit.api.dto;

import com.snapfit.api.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductDetailDto {
    private Product product;
    private long viewCount;
    private long likesCount;
    private boolean likedByUser;
} 