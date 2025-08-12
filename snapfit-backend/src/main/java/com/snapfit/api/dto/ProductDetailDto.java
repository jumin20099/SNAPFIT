package com.snapfit.api.dto;

import com.snapfit.api.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductDetailDto {
    private Product product;
    // 누적 조회수 (DB)
    private long viewCount;
    private long likesCount;
    private boolean likedByUser;
    // 실시간 시청자 수 (Redis)
    private long liveViewers;
}