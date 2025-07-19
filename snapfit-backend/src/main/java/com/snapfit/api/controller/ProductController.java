package com.snapfit.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.Map;

import com.snapfit.api.dto.ProductDto;
import com.snapfit.api.entity.Product;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.service.ProductService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductRepository productRepository;
    private final ProductService productService;

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@RequestBody ProductDto dto) {
        try {
            Product product = Product.builder()
                .storeIdx(dto.getStoreIdx())
                .productName(dto.getProductName())
                .productContent(dto.getProductContent())
                .productPrice(dto.getProductPrice())
                .productImage(dto.getProductImage())
                .productCategory(dto.getProductCategory())
                .productLink(dto.getProductLink())
                .isActive(true)
                .build();
            return ResponseEntity.ok(productRepository.save(product));
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔에 실제 에러 메시지 출력
            throw new RuntimeException("상품 등록 실패: " + e.getMessage(), e);
        }
    }

    @GetMapping
    public List<Product> getProductsByStoreIdx(@RequestParam Long store_idx) {
        return productService.getProductsByStoreIdx(store_idx);
    }

    @GetMapping("/list")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateProductStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Boolean isActive = (Boolean) body.get("isActive");
        Product product = productRepository.findById(id).orElseThrow();
        product.setIsActive(isActive);
        productRepository.save(product);
        return ResponseEntity.ok().body(Map.of("success", true, "message", "상태 변경 완료"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        try {
            // 1. 기존 상품 조회
            Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            // 2. 전달받은 값으로 필드만 업데이트
            product.setStoreIdx(dto.getStoreIdx());
            product.setProductName(dto.getProductName());
            product.setProductContent(dto.getProductContent());
            product.setProductPrice(dto.getProductPrice());
            product.setProductImage(dto.getProductImage());
            product.setProductCategory(dto.getProductCategory());
            product.setProductLink(dto.getProductLink());
            // 필요하다면 isActive 등도 업데이트

            // 3. 저장
            productRepository.save(product);

            return ResponseEntity.ok(product);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("상품 수정 실패: " + e.getMessage(), e);
        }
    }
}