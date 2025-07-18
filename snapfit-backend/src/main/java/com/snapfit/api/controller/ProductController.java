package com.snapfit.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

import com.snapfit.api.dto.ProductDto;
import com.snapfit.api.entity.Product;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.service.ProductService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductRepository productRepository;
    private final ProductService productService;

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

    @GetMapping
    public List<Product> getProductsByStoreIdx(@RequestParam Long store_idx) {
        return productService.getProductsByStoreIdx(store_idx);
    }

    @GetMapping("/list")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}