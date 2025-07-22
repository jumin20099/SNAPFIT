package com.snapfit.api.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.snapfit.api.dto.BulkProductApprovalActionDto;
import com.snapfit.api.dto.PartnerApplicationActionDto;
import com.snapfit.api.dto.PartnerApplicationAdminDto;
import com.snapfit.api.dto.PartnerApplicationDto;
import com.snapfit.api.dto.PartnerDashboardDto;
import com.snapfit.api.dto.PartnerProductDto;
import com.snapfit.api.dto.ProductApprovalActionDto;
import com.snapfit.api.entity.PartnerApplication;
import com.snapfit.api.entity.PartnerProduct;
import com.snapfit.api.entity.Product;
import com.snapfit.api.entity.Store;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.PartnerApplicationRepository;
import com.snapfit.api.repository.PartnerProductRepository;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.repository.StoreRepository;
import com.snapfit.api.repository.UserRepository;

@Service
public class PartnerService {
    
    @Autowired
    private PartnerApplicationRepository partnerApplicationRepository;
    
    @Autowired
    private PartnerProductRepository partnerProductRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    // 제휴사 신청 제출
    public PartnerApplicationDto submitApplication(PartnerApplicationDto dto) {
        PartnerApplication application = new PartnerApplication();
        application.setCompanyName(dto.getCompanyName());
        application.setContactEmail(dto.getContactEmail());
        application.setContactPhone(dto.getContactPhone());
        application.setBusinessRegistration(dto.getBusinessRegistration());
        application.setBusinessRegistrationFile(dto.getBusinessRegistrationFile());
        application.setLogo(dto.getLogo());
        application.setStoreLink(dto.getStoreLink());
        application.setRoyaltyRate(dto.getRoyaltyRate());

        // 인증 정보가 없으면 401 에러 발생
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new org.springframework.security.access.AccessDeniedException("로그인 후 신청 가능합니다.");
        }
        String email = authentication.getName();
        java.util.Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("유저 정보를 찾을 수 없습니다.");
        }
        application.setUserIdx(userOpt.get().getUserIdx());

        application.setStatus(PartnerApplication.ApplicationStatus.PENDING);
        
        PartnerApplication saved = partnerApplicationRepository.save(application);
        return convertToDto(saved);
    }
    
    // 제휴사 신청 조회
    public PartnerApplicationDto getApplication() {
        Optional<PartnerApplication> application = partnerApplicationRepository.findFirstByOrderByCreatedAtDesc();
        return application.map(this::convertToDto).orElse(null);
    }
    
    // 제휴사 신청 수정
    public PartnerApplicationDto updateApplication(Long id, PartnerApplicationDto dto) {
        Optional<PartnerApplication> existing = partnerApplicationRepository.findById(id);
        if (existing.isPresent()) {
            PartnerApplication application = existing.get();
            application.setCompanyName(dto.getCompanyName());
            application.setContactEmail(dto.getContactEmail());
            application.setContactPhone(dto.getContactPhone());
            application.setBusinessRegistration(dto.getBusinessRegistration());
            application.setBusinessRegistrationFile(dto.getBusinessRegistrationFile());
            
            PartnerApplication saved = partnerApplicationRepository.save(application);
            return convertToDto(saved);
        }
        return null;
    }
    
    // 상품 등록
    public PartnerProductDto submitProduct(PartnerProductDto dto) {
        PartnerProduct product = new PartnerProduct();
        product.setProductName(dto.getProductName());
        product.setProductContent(dto.getProductContent());
        product.setProductImage(dto.getProductImage());
        product.setProductLink(dto.getProductLink());
        product.setProductCategory(dto.getProductCategory());
        product.setProductPrice(dto.getProductPrice());
        product.setPartnerApplicationId(dto.getPartnerApplicationId());
        product.setStatus(PartnerProduct.ProductStatus.PENDING);
        
        PartnerProduct saved = partnerProductRepository.save(product);
        return convertToProductDto(saved);
    }
    
    // 상품 목록 조회
    public List<PartnerProductDto> getProducts(Long partnerApplicationId) {
        List<PartnerProduct> products = partnerProductRepository.findByPartnerApplicationIdOrderByCreatedAtDesc(partnerApplicationId);
        return products.stream()
                .map(this::convertToProductDto)
                .collect(Collectors.toList());
    }
    
    // 상품 수정
    public PartnerProductDto updateProduct(Long id, PartnerProductDto dto) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            product.setProductName(dto.getProductName());
            product.setProductContent(dto.getProductContent());
            product.setProductImage(dto.getProductImage());
            product.setProductLink(dto.getProductLink());
            product.setProductCategory(dto.getProductCategory());
            product.setProductPrice(dto.getProductPrice());
            
            PartnerProduct saved = partnerProductRepository.save(product);
            return convertToProductDto(saved);
        }
        return null;
    }
    
    // 상품 삭제
    public boolean deleteProduct(Long id) {
        Optional<PartnerProduct> opt = partnerProductRepository.findById(id);
        if (opt.isEmpty()) return false;
        partnerProductRepository.deleteById(id);
        return true;
    }
    
    // 대시보드 정보 조회
    public PartnerDashboardDto getDashboard(Long partnerApplicationId) {
        PartnerDashboardDto dashboard = new PartnerDashboardDto();
        
        // partnerApplicationId가 null이면 기본값 사용
        Long applicationId = partnerApplicationId != null ? partnerApplicationId : 1L;
        
        // 신청 상태 조회
        Optional<PartnerApplication> application = partnerApplicationRepository.findById(applicationId);
        if (application.isPresent()) {
            dashboard.setApplicationStatus(application.get().getStatus().name().toLowerCase());
        } else {
            dashboard.setApplicationStatus("pending");
        }
        
        // 상품 통계 조회
        List<PartnerProduct> products = partnerProductRepository.findByPartnerApplicationIdOrderByCreatedAtDesc(applicationId);
        dashboard.setTotalProducts(products.size());
        dashboard.setApprovedProducts((int) products.stream()
                .filter(p -> p.getStatus() == PartnerProduct.ProductStatus.APPROVED)
                .count());
        dashboard.setPendingProducts((int) products.stream()
                .filter(p -> p.getStatus() == PartnerProduct.ProductStatus.PENDING)
                .count());
        dashboard.setRejectedProducts((int) products.stream()
                .filter(p -> p.getStatus() == PartnerProduct.ProductStatus.REJECTED)
                .count());
        
        // 매출 (현재는 0으로 설정)
        dashboard.setMonthlyRevenue(0);
        
        // 최근 활동 - 실제 상품 등록 활동만 표시
        List<PartnerDashboardDto.ActivityDto> activities = products.stream()
                .limit(5)
                .map(product -> new PartnerDashboardDto.ActivityDto(
                    product.getId(),
                    "product",
                    "상품 등록: " + product.getProductName(),
                    product.getSubmittedDate().format(DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm"))
                ))
                .collect(Collectors.toList());
        
        dashboard.setRecentActivities(activities);
        
        return dashboard;
    }
    
    // Entity를 DTO로 변환
    private PartnerApplicationDto convertToDto(PartnerApplication application) {
        return new PartnerApplicationDto(
            application.getId(),
            application.getCompanyName(),
            application.getContactEmail(),
            application.getContactPhone(),
            application.getBusinessRegistration(),
            application.getBusinessRegistrationFile(),
            application.getLogo(),
            application.getStoreLink(),
            application.getRoyaltyRate(),
            application.getUserIdx(),
            application.getApplicationDate(),
            application.getStatus().name().toLowerCase(),
            application.getRejectionReason(),
            application.getCreatedAt(),
            application.getUpdatedAt()
        );
    }
    
    // Entity를 Product DTO로 변환
    private PartnerProductDto convertToProductDto(PartnerProduct product) {
        // 제휴사 정보 조회
        String companyName = null;
        if (product.getPartnerApplicationId() != null) {
            Optional<PartnerApplication> partnerApp = partnerApplicationRepository.findById(product.getPartnerApplicationId());
            if (partnerApp.isPresent()) {
                companyName = partnerApp.get().getCompanyName();
            }
        }
        
        PartnerProductDto dto = new PartnerProductDto();
        dto.setId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setProductContent(product.getProductContent());
        dto.setProductImage(product.getProductImage());
        dto.setProductLink(product.getProductLink());
        dto.setProductCategory(product.getProductCategory());
        dto.setProductPrice(product.getProductPrice());
        dto.setStatus(product.getStatus().name().toLowerCase());
        dto.setPartnerApplicationId(product.getPartnerApplicationId());
        dto.setPartnerCompanyName(companyName);
        dto.setRejectionReason(product.getRejectionReason());
        dto.setSubmittedDate(product.getSubmittedDate());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }
    
    // Entity를 Admin DTO로 변환
    private PartnerApplicationAdminDto convertToAdminDto(PartnerApplication application) {
        return new PartnerApplicationAdminDto(
            application.getId(),
            application.getCompanyName(),
            application.getContactEmail(),
            application.getContactPhone(),
            application.getBusinessRegistration(),
            application.getBusinessRegistrationFile(),
            application.getLogo(),
            application.getStoreLink(),
            application.getRoyaltyRate(),
            application.getApplicationDate(),
            application.getStatus().name().toLowerCase(),
            application.getRejectionReason(),
            application.getCreatedAt(),
            application.getUpdatedAt()
        );
    }
    
    // 어드민용 제휴 신청 목록 조회
    public List<PartnerApplicationAdminDto> getAllApplications() {
        List<PartnerApplication> applications = partnerApplicationRepository.findAllByOrderByCreatedAtDesc();
        return applications.stream()
                .map(this::convertToAdminDto)
                .collect(Collectors.toList());
    }
    
    // 어드민용 제휴 신청 상세 조회
    public PartnerApplicationAdminDto getApplicationById(Long id) {
        Optional<PartnerApplication> application = partnerApplicationRepository.findById(id);
        return application.map(this::convertToAdminDto).orElse(null);
    }
    
    // 어드민용 제휴 신청 승인/거절
    public PartnerApplicationAdminDto updateApplicationStatus(Long id, PartnerApplicationActionDto actionDto) {
        Optional<PartnerApplication> existing = partnerApplicationRepository.findById(id);
        if (existing.isPresent()) {
            PartnerApplication application = existing.get();
            
            if ("approve".equals(actionDto.getAction())) {
                application.setStatus(PartnerApplication.ApplicationStatus.APPROVED);
                application.setRejectionReason(null);
                
                // 승인 시 사용자 권한 변경
                Optional<User> user = userRepository.findByUserIdx(application.getUserIdx());
                if (user.isPresent()) {
                    User updatedUser = user.get();
                    updatedUser.setRole(User.Role.PARTNER);
                    userRepository.save(updatedUser);
                }

                // ★ 승인 시 stores 테이블에 제휴사 정보 등록
                Store store = Store.builder()
                    .storeName(application.getCompanyName())
                    .contact(application.getContactPhone())
                    .storeLogo(application.getLogo())
                    .storeLink(application.getStoreLink())
                    .royaltyRate(application.getRoyaltyRate())
                    .isActive(true)
                    .build();
                storeRepository.save(store);
            } else if ("reject".equals(actionDto.getAction())) {
                application.setStatus(PartnerApplication.ApplicationStatus.REJECTED);
                application.setRejectionReason(actionDto.getRejectionReason());
            }
            
            PartnerApplication saved = partnerApplicationRepository.save(application);
            return convertToAdminDto(saved);
        }
        return null;
    }

    // 어드민용 상품 전체 목록 조회 (모든 상태)
    public List<PartnerProductDto> getAllProducts() {
        List<PartnerProduct> products = partnerProductRepository.findAll();
        return products.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(this::convertToProductDto)
            .collect(Collectors.toList());
    }

    // 어드민용 상품 개별 승인/거절
    public PartnerProductDto updateProductStatus(Long id, ProductApprovalActionDto actionDto) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            if ("approve".equals(actionDto.getAction())) {
                product.setStatus(PartnerProduct.ProductStatus.APPROVED);
                product.setRejectionReason(null);
                
                // ★ 승인된 상품을 products 테이블로 이관
                transferApprovedProductToProductsTable(product);
                
            } else if ("reject".equals(actionDto.getAction())) {
                product.setStatus(PartnerProduct.ProductStatus.REJECTED);
                product.setRejectionReason(actionDto.getRejectionReason());
            }
            PartnerProduct saved = partnerProductRepository.save(product);
            return convertToProductDto(saved);
        }
        return null;
    }

    // 어드민용 상품 일괄 승인/거절
    public List<PartnerProductDto> bulkUpdateProductStatus(BulkProductApprovalActionDto bulkDto) {
        List<PartnerProductDto> result = new java.util.ArrayList<>();
        for (Long id : bulkDto.getIds()) {
            ProductApprovalActionDto actionDto = new ProductApprovalActionDto();
            actionDto.setAction(bulkDto.getAction());
            actionDto.setRejectionReason(bulkDto.getRejectionReason());
            PartnerProductDto updated = updateProductStatus(id, actionDto);
            if (updated != null) result.add(updated);
        }
        return result;
    }
    
        // 이메일로 사용자의 partnerApplicationId 찾기
    public Long getPartnerApplicationIdByEmail(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                List<PartnerApplication> apps = partnerApplicationRepository.findByUserIdx(user.getUserIdx());
                if (!apps.isEmpty()) {
                    return apps.get(0).getId();
                }
                // userIdx 로는 못 찾았을 때, contactEmail 로 검색 (기존 데이터 호환)
                var appByEmail = partnerApplicationRepository.findByContactEmail(email);
                if (appByEmail.isPresent()) {
                    return appByEmail.get().getId();
                }
            }
        } catch (Exception e) {
            System.err.println("사용자의 partnerApplicationId 조회 실패: " + e.getMessage());
        }
        return null;
    }


    // 승인된 상품을 products 테이블로 이관하는 메서드
    private void transferApprovedProductToProductsTable(PartnerProduct partnerProduct) {
        try {
            // 제휴사 정보에서 storeIdx 찾기
            Long storeIdx = null;
            if (partnerProduct.getPartnerApplicationId() != null) {
                Optional<PartnerApplication> partnerApp = partnerApplicationRepository.findById(partnerProduct.getPartnerApplicationId());
                if (partnerApp.isPresent()) {
                    String companyName = partnerApp.get().getCompanyName();
                    
                    // 제휴사 이름으로 stores 테이블에서 해당 store 찾기
                    List<Store> stores = storeRepository.findByStoreName(companyName);
                    if (!stores.isEmpty()) {
                        storeIdx = stores.get(0).getStoreIdx();
                    }
                }
            }
            
            // storeIdx를 찾지 못한 경우 기본값 사용
            if (storeIdx == null) {
                storeIdx = 1L; // 기본 store ID
            }
            
            // Product 엔티티 생성
            Product product = Product.builder()
                .storeIdx(storeIdx)
                .productName(partnerProduct.getProductName())
                .productContent(partnerProduct.getProductContent())
                .productPrice(partnerProduct.getProductPrice())
                .productImage(partnerProduct.getProductImage())
                .productCategory(partnerProduct.getProductCategory())
                .productLink(partnerProduct.getProductLink())
                .isActive(true)
                .build();
            
            // products 테이블에 저장
            productRepository.save(product);
            
        } catch (Exception e) {
            System.err.println("제휴사 상품을 products 테이블로 이관 중 오류 발생: " + e.getMessage());
        }
    }

} 