package com.snapfit.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.snapfit.api.entity.Product;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.dto.ProductDetailDto;
import com.snapfit.api.service.ViewCounterService;
import com.snapfit.api.entity.Like.TargetType;
import com.snapfit.api.service.LikeService;
import com.snapfit.api.entity.User;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final LikeService likeService;
    private final ViewCounterService viewCounterService;

    @Autowired
    public ProductService(ProductRepository productRepository, LikeService likeService, ViewCounterService viewCounterService) {
        this.productRepository = productRepository;
        this.likeService = likeService;
        this.viewCounterService = viewCounterService;
    }

    public List<Product> getProductsByStoreIdx(Long storeIdx) {
        return productRepository.findByStoreIdx(storeIdx);
    }

    public ProductDetailDto getProductDetail(Long productId, com.snapfit.api.entity.User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        String key = "product:" + productId + ":views";
        long viewCount = viewCounterService.getCount(key);
        long likesCount = likeService.countLikes(productId, TargetType.PRODUCT);
        boolean likedByUser = false;
        if (user != null) {
            likedByUser = likeService.listUserLikes(user).stream()
                    .anyMatch(like -> like.getTargetIdx().equals(productId) && like.getTargetType() == TargetType.PRODUCT);
        }
        return new ProductDetailDto(product, viewCount, likesCount, likedByUser);
    }
}