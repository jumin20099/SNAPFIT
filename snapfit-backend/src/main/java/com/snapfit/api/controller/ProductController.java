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
import java.util.Optional;

import com.snapfit.api.dto.ProductDto;
import com.snapfit.api.entity.Product;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.repository.PartnerProductRepository;
import com.snapfit.api.service.ProductService;
import com.snapfit.api.repository.PartnerApplicationRepository;
import com.snapfit.api.repository.StoreRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductRepository productRepository;
    private final PartnerProductRepository partnerProductRepository;
    private final ProductService productService;
    private final PartnerApplicationRepository partnerApplicationRepository;
    private final StoreRepository storeRepository;

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
                .genderCategory(dto.getGenderCategory())
                .majorCategory(dto.getMajorCategory())
                .subCategory(dto.getSubCategory())
                .productLink(dto.getProductLink())
                .isActive(true)
                .build();
            return ResponseEntity.ok(productRepository.save(product));
        } catch (Exception e) {
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

    // 제휴사(applicationId) 기준 상품 조회
    @GetMapping("/by-partner")
    public ResponseEntity<List<Product>> getProductsByPartner(@RequestParam Long partnerApplicationId) {
        try {
            // partner application → companyName → storeIdx
            Optional<com.snapfit.api.entity.PartnerApplication> appOpt = partnerApplicationRepository.findById(partnerApplicationId);
            if(appOpt.isEmpty()) return ResponseEntity.ok(List.of());
            String company = appOpt.get().getCompanyName();
            List<com.snapfit.api.entity.Store> stores = storeRepository.findByStoreName(company);
            if(stores.isEmpty()) return ResponseEntity.ok(List.of());
            Long storeIdx = stores.get(0).getStoreIdx();
            return ResponseEntity.ok(productRepository.findByStoreIdx(storeIdx));
        } catch(Exception e){
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateProductStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Boolean isActive = (Boolean) body.get("isActive");

            // 1) 일반 상품 먼저 시도
            Optional<Product> prodOpt = productRepository.findById(id);
            if (prodOpt.isPresent()) {
                Product product = prodOpt.get();
                product.setIsActive(isActive);
                product.setDeactivatedAt(Boolean.FALSE.equals(isActive) ? java.time.LocalDateTime.now() : null);
                productRepository.save(product);
                return ResponseEntity.ok().body(Map.of("success", true, "message", "상태 변경 완료"));
            }

            // 2) 제휴사 상품
            Optional<com.snapfit.api.entity.PartnerProduct> partnerOpt = partnerProductRepository.findById(id);
            if (partnerOpt.isPresent()) {
                var p = partnerOpt.get();
                p.setIsActive(isActive);
                p.setDeactivatedAt(Boolean.FALSE.equals(isActive) ? java.time.LocalDateTime.now() : null);
                partnerProductRepository.save(p);
                return ResponseEntity.ok().body(Map.of("success", true, "message", "상태 변경 완료"));
            }

            return ResponseEntity.status(404).body("상품을 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        try {
            Product product = productRepository.findById(id).orElseThrow();
            product.setProductName(dto.getProductName());
            product.setProductContent(dto.getProductContent());
            product.setProductPrice(dto.getProductPrice());
            product.setProductImage(dto.getProductImage());
            product.setProductCategory(dto.getProductCategory());
            product.setGenderCategory(dto.getGenderCategory());
            product.setMajorCategory(dto.getMajorCategory());
            product.setSubCategory(dto.getSubCategory());
            product.setProductLink(dto.getProductLink());
            productRepository.save(product);
            return ResponseEntity.ok().body(Map.of("success", true, "message", "상품 수정 완료"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("상품 수정 실패: " + e.getMessage());
        }
    }
}

// 제휴사 측에서 상품 수정 요청 했을때 원본 표시하는거 수정 해야함 주민아