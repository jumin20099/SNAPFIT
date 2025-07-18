package com.snapfit.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.snapfit.api.entity.Product;
import com.snapfit.api.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getProductsByStoreIdx(Long storeIdx) {
        return productRepository.findByStore_StoreIdx(storeIdx);
    }
}