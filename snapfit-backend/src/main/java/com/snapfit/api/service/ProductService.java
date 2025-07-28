package com.snapfit.api.service;

import java.util.List;
import java.util.stream.Collectors;

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

        public List<Product> getActiveProducts(String major, String sub) {
        try {
            List<Product> products = productRepository.findByIsActiveTrue();
            
            if (major != null && !major.isBlank()) {
                products = products.stream()
                    .filter(p -> major.equals(p.getMajorCategory()))
                    .collect(Collectors.toList());
            }
            
            if (sub != null && !sub.isBlank()) {
                if ("신상".equals(sub)) {
                    return products.stream()
                        .filter(Product::isNewProduct)
                        .collect(Collectors.toList());
                } else {
                    products = products.stream()
                        .filter(p -> sub.equals(p.getSubCategory()))
                        .collect(Collectors.toList());
                }
            }
            
            return products;
        } catch (Exception e) {
            System.err.println("Error in getActiveProducts - major: " + major + ", sub: " + sub);
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 상품 목록을 반환할 때 신상 카테고리를 자동으로 처리
     * @param products 원본 상품 목록
     * @return 신상 카테고리가 적용된 상품 목록
     */
    public List<Product> processNewProductCategory(List<Product> products) {
        return products.stream()
            .map(product -> {
                // 신상인 경우에만 subCategory를 "신상"으로 설정 (이미 설정된 경우는 유지)
                if (product.isNewProduct() && (product.getSubCategory() == null || product.getSubCategory().equals("신상"))) {
                    product.setSubCategory("신상");
                }
                return product;
            })
            .collect(Collectors.toList());
    }

    public ProductDetailDto getProductDetail(Long productIdx, User user) {
        Product product = productRepository.findById(productIdx)
            .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        // 조회수 증가
        String key = "product:" + productIdx + ":views";
        long viewCount = viewCounterService.increment(key);

        // 좋아요 개수 및 사용자 좋아요 여부 확인
        long likesCount = likeService.countLikes(productIdx, TargetType.PRODUCT);
        boolean likedByUser = false;
        if (user != null) {
            likedByUser = likeService.listUserLikes(user).stream()
                .anyMatch(like -> like.getTargetIdx().equals(productIdx) && like.getTargetType() == TargetType.PRODUCT);
        }

        // 신상 카테고리 처리
        if (product.isNewProduct()) {
            product.setSubCategory("신상");
        }

        return new ProductDetailDto(product, viewCount, likesCount, likedByUser);
    }
}