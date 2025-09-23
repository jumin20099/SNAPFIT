package com.snapfit.api.service;

import com.snapfit.api.dto.SizeVariantDto;
import com.snapfit.api.entity.Product;
import com.snapfit.api.entity.SizeVariant;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.repository.SizeVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SizeVariantService {
    
    private final SizeVariantRepository sizeVariantRepository;
    private final ProductRepository productRepository;
    
    /**
     * 상품별 활성화된 사이즈 변형 조회
     */
    public List<SizeVariantDto> getSizeVariantsByProduct(Long productId) {
        log.info("상품 {}의 사이즈 변형 조회", productId);
        
        List<SizeVariant> variants = sizeVariantRepository.findByProductIdAndActiveTrueOrderBySortOrder(productId);
        
        return variants.stream()
                .map(SizeVariantDto::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 상품별 재고가 있는 사이즈 변형만 조회
     */
    public List<SizeVariantDto> getInStockSizeVariantsByProduct(Long productId) {
        log.info("상품 {}의 재고 있는 사이즈 변형 조회", productId);
        
        List<SizeVariant> variants = sizeVariantRepository.findInStockByProductId(productId);
        
        return variants.stream()
                .map(SizeVariantDto::simple)
                .collect(Collectors.toList());
    }
    
    /**
     * 상품별 모든 사이즈 변형 조회 (관리자용)
     */
    public List<SizeVariantDto> getAllSizeVariantsByProduct(Long productId) {
        log.info("상품 {}의 모든 사이즈 변형 조회 (관리자용)", productId);
        
        List<SizeVariant> variants = sizeVariantRepository.findByProductIdOrderBySortOrder(productId);
        
        return variants.stream()
                .map(SizeVariantDto::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 특정 사이즈 변형 조회
     */
    public Optional<SizeVariantDto> getSizeVariant(Long sizeVariantId) {
        log.info("사이즈 변형 {} 조회", sizeVariantId);
        
        return sizeVariantRepository.findById(sizeVariantId)
                .map(SizeVariantDto::from);
    }
    
    /**
     * SKU로 사이즈 변형 조회
     */
    public Optional<SizeVariantDto> getSizeVariantBySku(String sku) {
        log.info("SKU {}로 사이즈 변형 조회", sku);
        
        return sizeVariantRepository.findBySku(sku)
                .map(SizeVariantDto::from);
    }
    
    /**
     * 상품별 특정 사이즈 라벨 조회
     */
    public Optional<SizeVariantDto> getSizeVariantByProductAndLabel(Long productId, String sizeLabel) {
        log.info("상품 {}의 사이즈 {} 조회", productId, sizeLabel);
        
        return sizeVariantRepository.findByProductIdAndSizeLabel(productId, sizeLabel)
                .map(SizeVariantDto::from);
    }
    
    /**
     * 사이즈 변형 생성
     */
    @Transactional
    public SizeVariantDto createSizeVariant(Long productId, SizeVariantDto sizeVariantDto) {
        log.info("상품 {}에 사이즈 변형 생성: {}", productId, sizeVariantDto.getSizeLabel());
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + productId));
        
        // SKU 중복 확인
        if (sizeVariantDto.getSku() != null && 
            sizeVariantRepository.findBySku(sizeVariantDto.getSku()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 SKU입니다: " + sizeVariantDto.getSku());
        }
        
        // 동일한 사이즈 라벨 중복 확인
        if (sizeVariantRepository.findByProductIdAndSizeLabel(productId, sizeVariantDto.getSizeLabel()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사이즈입니다: " + sizeVariantDto.getSizeLabel());
        }
        
        SizeVariant sizeVariant = SizeVariant.builder()
                .product(product)
                .sizeLabel(sizeVariantDto.getSizeLabel())
                .sizeValue(sizeVariantDto.getSizeValue())
                .sku(sizeVariantDto.getSku())
                .additionalPrice(sizeVariantDto.getAdditionalPrice() != null ? sizeVariantDto.getAdditionalPrice() : 0)
                .isActive(sizeVariantDto.getIsActive() != null ? sizeVariantDto.getIsActive() : true)
                .sortOrder(sizeVariantDto.getSortOrder() != null ? sizeVariantDto.getSortOrder() : 0)
                .build();
        
        SizeVariant savedVariant = sizeVariantRepository.save(sizeVariant);
        log.info("사이즈 변형 생성 완료: {}", savedVariant.getSizeVariantId());
        
        return SizeVariantDto.from(savedVariant);
    }
    
    /**
     * 사이즈 변형 수정
     */
    @Transactional
    public SizeVariantDto updateSizeVariant(Long sizeVariantId, SizeVariantDto sizeVariantDto) {
        log.info("사이즈 변형 {} 수정", sizeVariantId);
        
        SizeVariant sizeVariant = sizeVariantRepository.findById(sizeVariantId)
                .orElseThrow(() -> new IllegalArgumentException("사이즈 변형을 찾을 수 없습니다: " + sizeVariantId));
        
        // SKU 중복 확인 (자신 제외)
        if (sizeVariantDto.getSku() != null && 
            sizeVariantRepository.findBySku(sizeVariantDto.getSku())
                .filter(sv -> !sv.getSizeVariantId().equals(sizeVariantId))
                .isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 SKU입니다: " + sizeVariantDto.getSku());
        }
        
        // 필드 업데이트
        if (sizeVariantDto.getSizeLabel() != null) {
            sizeVariant.setSizeLabel(sizeVariantDto.getSizeLabel());
        }
        if (sizeVariantDto.getSizeValue() != null) {
            sizeVariant.setSizeValue(sizeVariantDto.getSizeValue());
        }
        if (sizeVariantDto.getSku() != null) {
            sizeVariant.setSku(sizeVariantDto.getSku());
        }
        if (sizeVariantDto.getAdditionalPrice() != null) {
            sizeVariant.setAdditionalPrice(sizeVariantDto.getAdditionalPrice());
        }
        if (sizeVariantDto.getIsActive() != null) {
            sizeVariant.setIsActive(sizeVariantDto.getIsActive());
        }
        if (sizeVariantDto.getSortOrder() != null) {
            sizeVariant.setSortOrder(sizeVariantDto.getSortOrder());
        }
        
        SizeVariant savedVariant = sizeVariantRepository.save(sizeVariant);
        log.info("사이즈 변형 수정 완료: {}", savedVariant.getSizeVariantId());
        
        return SizeVariantDto.from(savedVariant);
    }
    
    /**
     * 사이즈 변형 삭제 (비활성화)
     */
    @Transactional
    public void deleteSizeVariant(Long sizeVariantId) {
        log.info("사이즈 변형 {} 삭제 (비활성화)", sizeVariantId);
        
        SizeVariant sizeVariant = sizeVariantRepository.findById(sizeVariantId)
                .orElseThrow(() -> new IllegalArgumentException("사이즈 변형을 찾을 수 없습니다: " + sizeVariantId));
        
        sizeVariant.setIsActive(false);
        sizeVariantRepository.save(sizeVariant);
        
        log.info("사이즈 변형 삭제 완료: {}", sizeVariantId);
    }
    
    /**
     * 재고 부족 사이즈 변형 조회 (관리자용)
     */
    public List<SizeVariantDto> getLowStockSizeVariants(Long productId) {
        log.info("상품 {}의 재고 부족 사이즈 변형 조회", productId);
        
        List<SizeVariant> variants = sizeVariantRepository.findLowStockByProductId(productId);
        
        return variants.stream()
                .map(SizeVariantDto::from)
                .collect(Collectors.toList());
    }
}
