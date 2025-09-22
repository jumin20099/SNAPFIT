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
    // 실제 조회수 (12시간 중복 방지)
    private long actualViewCount;
    private long likesCount;
    private boolean likedByUser;
    // 실시간 시청자 수 (Redis)
    private long liveViewers;
    // 리뷰 통계
    private Double ratingAvg;
    private Integer reviewCount;
}