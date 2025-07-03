package com.snapfit.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapfit.api.dto.ProductDto;
import com.snapfit.api.entity.Product;
import com.snapfit.api.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductRepository productRepository;

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@RequestBody ProductDto dto) {
        Product product = Product.builder()
            .storeIdx(dto.getStoreIdx())
            .productName(dto.getProductName())
            .productContent(dto.getProductContent())
            .productPrice(dto.getProductPrice())
            .productImage(dto.getProductImage()) // S3 URL
            .productCategory(dto.getProductCategory())
            .productLink(dto.getProductLink())
            .isActive(true)
            .build();
        return ResponseEntity.ok(productRepository.save(product));
    }
}