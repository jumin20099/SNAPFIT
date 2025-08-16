package com.snapfit.api.service;

import java.time.LocalDateTime;
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
        // 1) 인증 사용자 확인
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new org.springframework.security.access.AccessDeniedException("로그인 필요");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("사용자 정보 없음"));

        // 2) 기존 신청 여부 확인 (PENDING 또는 APPROVED)
        java.util.List<PartnerApplication> exists = partnerApplicationRepository.findByUserIdx(user.getUserIdx());
        boolean hasActive = exists.stream()
                .anyMatch(app -> app.getStatus() == PartnerApplication.ApplicationStatus.PENDING ||
                               app.getStatus() == PartnerApplication.ApplicationStatus.APPROVED);
        if (hasActive) {
            throw new IllegalStateException("이미 제출된 제휴사 신청이 존재합니다.");
        }

        // 3) 새 신청 생성
        PartnerApplication application = new PartnerApplication();
        application.setUserIdx(user.getUserIdx());
        application.setCompanyName(dto.getCompanyName());
        application.setContactEmail(dto.getContactEmail());
        application.setContactPhone(dto.getContactPhone());
        application.setBusinessRegistration(dto.getBusinessRegistration());
        application.setBusinessRegistrationFile(dto.getBusinessRegistrationFile());
        application.setLogo(dto.getLogo());
        application.setStoreLink(dto.getStoreLink());
        application.setRoyaltyRate(dto.getRoyaltyRate());
        application.setStatus(PartnerApplication.ApplicationStatus.PENDING);
        
        // 4) Store 생성 및 store_idx 설정
        Store store = new Store();
        store.setStoreName(dto.getCompanyName());
        store.setStoreLink(dto.getStoreLink());
        store.setRoyaltyRate(dto.getRoyaltyRate());
        store.setContact(dto.getContactEmail());
        Store savedStore = storeRepository.save(store);
        application.setStoreIdx(savedStore.getStoreIdx());

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
        // 1) 인증 사용자 확인
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new org.springframework.security.access.AccessDeniedException("로그인 필요");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("사용자 정보 없음"));

        // 2) 사용자의 PartnerApplication 조회
        List<PartnerApplication> applications = partnerApplicationRepository.findByUserIdx(user.getUserIdx());
        PartnerApplication application = applications.stream()
                .filter(app -> app.getStatus() == PartnerApplication.ApplicationStatus.APPROVED)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("승인된 제휴사 신청이 없습니다."));

        // 3) PartnerApplication에서 store_idx 가져오기
        if (application.getStoreIdx() == null) {
            throw new IllegalStateException("제휴사 신청에 스토어 정보가 없습니다.");
        }

        PartnerProduct product = new PartnerProduct();
        product.setStoreIdx(application.getStoreIdx());  // store_idx 설정
        product.setProductName(dto.getProductName());
        product.setProductContent(dto.getProductContent());
        product.setProductImage(dto.getProductImage());
        product.setProductLink(dto.getProductLink());
        
        // product_category를 major_category로 설정 (null이 아닌 경우)
        if (dto.getProductCategory() != null && !dto.getProductCategory().trim().isEmpty()) {
            product.setProductCategory(dto.getProductCategory());
        } else if (dto.getMajorCategory() != null && !dto.getMajorCategory().trim().isEmpty()) {
            product.setProductCategory(dto.getMajorCategory());
        } else {
            product.setProductCategory("기타"); // 기본값 설정
        }
        
        product.setProductPrice(dto.getProductPrice());
        product.setPartnerApplicationId(application.getId());
        product.setStatus(PartnerProduct.ProductStatus.PENDING);
        product.setGenderCategory(dto.getGenderCategory());
        product.setMajorCategory(dto.getMajorCategory());
        product.setSubCategory(dto.getSubCategory());
        
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
    
    // 상품 수정 요청
    public PartnerProductDto updateProduct(Long id, PartnerProductDto dto) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            
            // 현재 데이터를 원본 데이터로 백업 (첫 수정 요청인 경우에만)
            if (product.getUpdateRequestStatus() == PartnerProduct.UpdateRequestStatus.NO_UPDATE) {
                product.setOriginalProductName(product.getProductName());
                product.setOriginalProductContent(product.getProductContent());
                product.setOriginalProductImage(product.getProductImage());
                product.setOriginalProductLink(product.getProductLink());
                product.setOriginalGenderCategory(product.getGenderCategory());
                product.setOriginalMajorCategory(product.getMajorCategory());
                product.setOriginalSubCategory(product.getSubCategory());
                product.setOriginalProductPrice(product.getProductPrice());
            }
            
            // 수정 요청 데이터를 별도 필드에 저장
            product.setRequestedProductName(dto.getProductName());
            product.setRequestedProductContent(dto.getProductContent());
            product.setRequestedProductImage(dto.getProductImage());
            product.setRequestedProductLink(dto.getProductLink());
            product.setRequestedGenderCategory(dto.getGenderCategory());
            product.setRequestedMajorCategory(dto.getMajorCategory());
            product.setRequestedSubCategory(dto.getSubCategory());
            product.setRequestedProductPrice(dto.getProductPrice());
            
            // 수정 요청 상태로 변경
            product.setUpdateRequestStatus(PartnerProduct.UpdateRequestStatus.PENDING_UPDATE);
            product.setUpdateRequestDate(LocalDateTime.now());
            
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
        int totalProducts = partnerProductRepository.countByPartnerApplicationId(applicationId);
        int approvedProducts = partnerProductRepository.countByPartnerApplicationIdAndStatus(
                applicationId, PartnerProduct.ProductStatus.APPROVED);
        int pendingProducts = partnerProductRepository.countByPartnerApplicationIdAndStatus(
                applicationId, PartnerProduct.ProductStatus.PENDING);
        int rejectedProducts = partnerProductRepository.countByPartnerApplicationIdAndStatus(
                applicationId, PartnerProduct.ProductStatus.REJECTED);

        dashboard.setTotalProducts(totalProducts);
        dashboard.setApprovedProducts(approvedProducts);
        dashboard.setPendingProducts(pendingProducts);
        dashboard.setRejectedProducts(rejectedProducts);

        // 매출 (현재는 0으로 설정)
        dashboard.setMonthlyRevenue(0);

        // 조회수 합계 집계: 승인된 상품만 대상으로 products 테이블에서 합산
        try {
            List<PartnerProduct> approved = partnerProductRepository
                    .findByPartnerApplicationIdAndStatus(applicationId, PartnerProduct.ProductStatus.APPROVED);
            long sumView = 0L;
            long sumActual = 0L;
            java.util.List<com.snapfit.api.dto.PartnerDashboardDto.ProductView> pv = new java.util.ArrayList<>();
            for (PartnerProduct pp : approved) {
                Optional<Product> live = productRepository.findByProductNameAndProductLink(
                        pp.getProductName(), pp.getProductLink());
                if (live.isPresent()) {
                    Product p = live.get();
                    sumView += p.getViewCount() == null ? 0L : p.getViewCount();
                    sumActual += p.getActualViewCount() == null ? 0L : p.getActualViewCount();
                    pv.add(new com.snapfit.api.dto.PartnerDashboardDto.ProductView(
                        p.getProductIdx(), p.getProductName(),
                        p.getViewCount() == null ? 0L : p.getViewCount(),
                        p.getActualViewCount() == null ? 0L : p.getActualViewCount()
                    ));
                }
            }
            dashboard.setTotalViewCount(sumView);
            dashboard.setTotalActualViewCount(sumActual);
            dashboard.setProductViews(pv);
        } catch (Exception ignore) {}

        // 최근 활동 (최신 5개)
        List<PartnerProduct> latest = partnerProductRepository
                .findByPartnerApplicationIdOrderByCreatedAtDesc(applicationId)
                .stream()
                .limit(5)
                .collect(Collectors.toList());

        List<PartnerDashboardDto.ActivityDto> activities = latest.stream()
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
        dto.setIsActive(product.getIsActive());
        dto.setRejectionReason(product.getRejectionReason());
        dto.setSubmittedDate(product.getSubmittedDate());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        dto.setGenderCategory(product.getGenderCategory());
        dto.setMajorCategory(product.getMajorCategory());
                dto.setSubCategory(product.getSubCategory());
        
        // 수정 요청 관련 필드들 매핑
        dto.setUpdateRequestStatus(product.getUpdateRequestStatus() != null ? product.getUpdateRequestStatus().name() : null);
        dto.setUpdateRequestReason(product.getUpdateRequestReason());
        dto.setUpdateRequestDate(product.getUpdateRequestDate());
        
        // 원본 데이터 필드들 매핑
        dto.setOriginalProductName(product.getOriginalProductName());
        dto.setOriginalProductContent(product.getOriginalProductContent());
        dto.setOriginalProductImage(product.getOriginalProductImage());
        dto.setOriginalProductLink(product.getOriginalProductLink());
        dto.setOriginalGenderCategory(product.getOriginalGenderCategory());
        dto.setOriginalMajorCategory(product.getOriginalMajorCategory());
        dto.setOriginalSubCategory(product.getOriginalSubCategory());
        dto.setOriginalProductPrice(product.getOriginalProductPrice());
        
        // 수정 요청 데이터 필드들 매핑
        dto.setRequestedProductName(product.getRequestedProductName());
        dto.setRequestedProductContent(product.getRequestedProductContent());
        dto.setRequestedProductImage(product.getRequestedProductImage());
        dto.setRequestedProductLink(product.getRequestedProductLink());
        dto.setRequestedGenderCategory(product.getRequestedGenderCategory());
        dto.setRequestedMajorCategory(product.getRequestedMajorCategory());
        dto.setRequestedSubCategory(product.getRequestedSubCategory());
        dto.setRequestedProductPrice(product.getRequestedProductPrice());
        
        // products 테이블의 뷰 카운트 조회(승인되어 products에 존재할 때만)
        try {
            Optional<Product> live = productRepository.findByProductNameAndProductLink(
                    product.getProductName(), product.getProductLink());
            if (live.isPresent()) {
                Product p = live.get();
                dto.setViewCount(p.getViewCount() == null ? 0L : p.getViewCount());
                dto.setActualViewCount(p.getActualViewCount() == null ? 0L : p.getActualViewCount());
            }
        } catch (Exception ignore) {}

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

    // 활성화 / 비활성화 토글
    public boolean toggleActivePartnerProduct(Long id, Boolean isActive) {
        Optional<PartnerProduct> opt = partnerProductRepository.findById(id);
        if (opt.isEmpty()) return false;
        PartnerProduct product = opt.get();
        product.setIsActive(isActive);
        product.setDeactivatedAt(isActive != null && !isActive ? java.time.LocalDateTime.now() : null);
        partnerProductRepository.save(product);
        return true;
    }
    

    
    // 상품 승인
    public void approveProduct(Long id) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct partnerProduct = existing.get();
            partnerProduct.setStatus(PartnerProduct.ProductStatus.APPROVED);
            partnerProductRepository.save(partnerProduct);
            
            // 승인된 상품을 products 테이블로 이동
            Product product = Product.builder()
                    .storeIdx(partnerProduct.getStoreIdx())
                    .productName(partnerProduct.getProductName())
                    .productContent(partnerProduct.getProductContent())
                    .productPrice(partnerProduct.getProductPrice())
                    .productImage(partnerProduct.getProductImage())
                    .productCategory(partnerProduct.getProductCategory())
                    .genderCategory(partnerProduct.getGenderCategory())
                    .majorCategory(partnerProduct.getMajorCategory())
                    .subCategory(partnerProduct.getSubCategory())
                    .productLink(partnerProduct.getProductLink())
                    .isActive(true)
                    .viewCount(0L)
                    .actualViewCount(0L)
                    .build();
            
            productRepository.save(product);
        } else {
            throw new IllegalStateException("상품을 찾을 수 없습니다.");
        }
    }
    
    // 상품 거절
    public void rejectProduct(Long id, String rejectionReason) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            product.setStatus(PartnerProduct.ProductStatus.REJECTED);
            product.setRejectionReason(rejectionReason);
            partnerProductRepository.save(product);
        } else {
            throw new IllegalStateException("상품을 찾을 수 없습니다.");
        }
    }
    
    // 수정 요청 승인
    public PartnerProductDto approveUpdateRequest(Long id) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            
            if (product.getUpdateRequestStatus() != PartnerProduct.UpdateRequestStatus.PENDING_UPDATE) {
                throw new IllegalStateException("승인 대기 중인 수정 요청이 아닙니다.");
            }
            
            // 수정 요청 데이터를 실제 상품 데이터로 적용
            product.setProductName(product.getRequestedProductName());
            product.setProductContent(product.getRequestedProductContent());
            product.setProductImage(product.getRequestedProductImage());
            product.setProductLink(product.getRequestedProductLink());
            product.setGenderCategory(product.getRequestedGenderCategory());
            product.setMajorCategory(product.getRequestedMajorCategory());
            product.setSubCategory(product.getRequestedSubCategory());
            product.setProductPrice(product.getRequestedProductPrice());
            
            // 수정 요청 승인 상태로 변경
            product.setUpdateRequestStatus(PartnerProduct.UpdateRequestStatus.APPROVED_UPDATE);
            
            PartnerProduct saved = partnerProductRepository.save(product);
            return convertToProductDto(saved);
        }
        return null;
    }
    
    // 수정 요청 거절
    public PartnerProductDto rejectUpdateRequest(Long id, String rejectionReason) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            
            if (product.getUpdateRequestStatus() != PartnerProduct.UpdateRequestStatus.PENDING_UPDATE) {
                throw new IllegalStateException("승인 대기 중인 수정 요청이 아닙니다.");
            }
            
            // 원본 데이터로 복원
            product.setProductName(product.getOriginalProductName());
            product.setProductContent(product.getOriginalProductContent());
            product.setProductImage(product.getOriginalProductImage());
            product.setProductLink(product.getOriginalProductLink());
            product.setGenderCategory(product.getOriginalGenderCategory());
            product.setMajorCategory(product.getOriginalMajorCategory());
            product.setSubCategory(product.getOriginalSubCategory());
            product.setProductPrice(product.getOriginalProductPrice());
            
            // 수정 요청 거절 상태로 변경
            product.setUpdateRequestStatus(PartnerProduct.UpdateRequestStatus.REJECTED_UPDATE);
            product.setRejectionReason(rejectionReason);
            
            PartnerProduct saved = partnerProductRepository.save(product);
            return convertToProductDto(saved);
        }
        return null;
    }
    
    // 수정 요청 취소
    public PartnerProductDto cancelUpdateRequest(Long id) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            
            if (product.getUpdateRequestStatus() != PartnerProduct.UpdateRequestStatus.PENDING_UPDATE) {
                throw new IllegalStateException("취소할 수정 요청이 없습니다.");
            }
            
            // 수정 요청 데이터 초기화
            product.setRequestedProductName(null);
            product.setRequestedProductContent(null);
            product.setRequestedProductImage(null);
            product.setRequestedProductLink(null);
            product.setRequestedGenderCategory(null);
            product.setRequestedMajorCategory(null);
            product.setRequestedSubCategory(null);
            product.setRequestedProductPrice(null);
            
            // 수정 요청 상태 초기화
            product.setUpdateRequestStatus(PartnerProduct.UpdateRequestStatus.NO_UPDATE);
            product.setUpdateRequestReason(null);
            product.setUpdateRequestDate(null);
            
            PartnerProduct saved = partnerProductRepository.save(product);
            return convertToProductDto(saved);
        }
        return null;
    }
    
    // 수정 요청 목록 조회
    public List<PartnerProductDto> getUpdateRequests() {
        List<PartnerProduct> products = partnerProductRepository.findByUpdateRequestStatus(PartnerProduct.UpdateRequestStatus.PENDING_UPDATE);
        return products.stream()
                .map(this::convertToProductDto)
                .collect(Collectors.toList());
    }
} 