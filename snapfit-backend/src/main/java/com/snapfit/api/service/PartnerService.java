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
import com.snapfit.api.dto.ProductUpdateRequestDto;
import com.snapfit.api.entity.PartnerApplication;
import com.snapfit.api.entity.PartnerProduct;
import com.snapfit.api.entity.Product;
import com.snapfit.api.entity.ProductUpdateRequest;
import com.snapfit.api.entity.Store;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.PartnerApplicationRepository;
import com.snapfit.api.repository.PartnerProductRepository;
import com.snapfit.api.repository.ProductRepository;
import com.snapfit.api.repository.ProductUpdateRequestRepository;
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
    
    @Autowired
    private ProductUpdateRequestRepository productUpdateRequestRepository;
    
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
    
    // 상품 수정 요청 (새로운 정규화된 방식)
    public PartnerProductDto updateProduct(Long id, PartnerProductDto dto) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(id);
        if (existing.isPresent()) {
            PartnerProduct product = existing.get();
            
            // 수정 요청 DTO 생성
            ProductUpdateRequestDto requestDto = ProductUpdateRequestDto.builder()
                .requestedProductName(dto.getProductName())
                .requestedProductContent(dto.getProductContent())
                .requestedProductImage(dto.getProductImage())
                .requestedProductLink(dto.getProductLink())
                .requestedGenderCategory(dto.getGenderCategory())
                .requestedMajorCategory(dto.getMajorCategory())
                .requestedSubCategory(dto.getSubCategory())
                .requestedProductPrice(dto.getProductPrice())
                .updateRequestReason("상품 정보 수정 요청")
                .build();
            
            // 수정 요청 생성
            createUpdateRequest(id, requestDto);
            
            return convertToProductDto(product);
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
                        product.getPartnerProductIdx(),
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
        dto.setId(product.getPartnerProductIdx());
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
        
        // 수정 요청 관련 필드들 매핑 (정규화 후에는 별도 테이블에서 관리)
        dto.setHasPendingUpdateRequest(product.getHasPendingUpdateRequest());
        
        // 최신 수정 요청 조회 (모든 상태의 요청)
        Optional<ProductUpdateRequest> updateRequest = productUpdateRequestRepository
            .findByPartnerProductIdOrderByCreatedAtDesc(product.getPartnerProductIdx())
            .stream()
            .findFirst();
        
        if (updateRequest.isPresent()) {
            ProductUpdateRequest request = updateRequest.get();
            dto.setUpdateRequestStatus(request.getUpdateRequestStatus().name());
            dto.setUpdateRequestReason(request.getUpdateRequestReason());
            dto.setUpdateRequestDate(request.getUpdateRequestDate());
            dto.setRejectionReason(request.getRejectionReason());
            
            // 원본 데이터 필드들 매핑
            dto.setOriginalProductName(request.getOriginalProductName());
            dto.setOriginalProductContent(request.getOriginalProductContent());
            dto.setOriginalProductImage(request.getOriginalProductImage());
            dto.setOriginalProductLink(request.getOriginalProductLink());
            dto.setOriginalGenderCategory(request.getOriginalGenderCategory());
            dto.setOriginalMajorCategory(request.getOriginalMajorCategory());
            dto.setOriginalSubCategory(request.getOriginalSubCategory());
            dto.setOriginalProductPrice(request.getOriginalProductPrice());
            
            // 수정 요청 데이터 필드들 매핑
            dto.setRequestedProductName(request.getRequestedProductName());
            dto.setRequestedProductContent(request.getRequestedProductContent());
            dto.setRequestedProductImage(request.getRequestedProductImage());
            dto.setRequestedProductLink(request.getRequestedProductLink());
            dto.setRequestedGenderCategory(request.getRequestedGenderCategory());
            dto.setRequestedMajorCategory(request.getRequestedMajorCategory());
            dto.setRequestedSubCategory(request.getRequestedSubCategory());
            dto.setRequestedProductPrice(request.getRequestedProductPrice());
            
            // hasPendingUpdateRequest는 실제 상태에 따라 설정
            dto.setHasPendingUpdateRequest(request.getUpdateRequestStatus() == ProductUpdateRequest.UpdateRequestStatus.PENDING_UPDATE);
        } else {
            dto.setUpdateRequestStatus("NO_UPDATE");
        }
        
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
            
            // 대기 중인 수정 요청 찾기
            Optional<ProductUpdateRequest> updateRequest = productUpdateRequestRepository
                .findByPartnerProductIdAndUpdateRequestStatus(
                    product.getPartnerProductIdx(), 
                    ProductUpdateRequest.UpdateRequestStatus.PENDING_UPDATE
                );
            
            if (!updateRequest.isPresent()) {
                throw new IllegalStateException("승인 대기 중인 수정 요청이 아닙니다.");
            }
            
            ProductUpdateRequest request = updateRequest.get();
            
            // 수정 요청 데이터를 실제 상품 데이터로 적용
            product.setProductName(request.getRequestedProductName());
            product.setProductContent(request.getRequestedProductContent());
            product.setProductImage(request.getRequestedProductImage());
            product.setProductLink(request.getRequestedProductLink());
            product.setGenderCategory(request.getRequestedGenderCategory());
            product.setMajorCategory(request.getRequestedMajorCategory());
            product.setSubCategory(request.getRequestedSubCategory());
            product.setProductPrice(request.getRequestedProductPrice());
            
            // 수정 요청 승인 상태로 변경
            request.setUpdateRequestStatus(ProductUpdateRequest.UpdateRequestStatus.APPROVED_UPDATE);
            productUpdateRequestRepository.save(request);
            
            // 수정 요청 플래그 업데이트
            product.setHasPendingUpdateRequest(false);
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
            
            // 대기 중인 수정 요청 찾기
            Optional<ProductUpdateRequest> updateRequest = productUpdateRequestRepository
                .findByPartnerProductIdAndUpdateRequestStatus(
                    product.getPartnerProductIdx(), 
                    ProductUpdateRequest.UpdateRequestStatus.PENDING_UPDATE
                );
            
            if (!updateRequest.isPresent()) {
                throw new IllegalStateException("승인 대기 중인 수정 요청이 아닙니다.");
            }
            
            ProductUpdateRequest request = updateRequest.get();
            
            // 원본 데이터로 복원
            product.setProductName(request.getOriginalProductName());
            product.setProductContent(request.getOriginalProductContent());
            product.setProductImage(request.getOriginalProductImage());
            product.setProductLink(request.getOriginalProductLink());
            product.setGenderCategory(request.getOriginalGenderCategory());
            product.setMajorCategory(request.getOriginalMajorCategory());
            product.setSubCategory(request.getOriginalSubCategory());
            product.setProductPrice(request.getOriginalProductPrice());
            
            // 수정 요청 거절 상태로 변경
            request.setUpdateRequestStatus(ProductUpdateRequest.UpdateRequestStatus.REJECTED_UPDATE);
            request.setRejectionReason(rejectionReason);
            productUpdateRequestRepository.save(request);
            
            // 수정 요청 플래그 업데이트
            product.setHasPendingUpdateRequest(false);
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
            
            // 대기 중인 수정 요청 찾기
            Optional<ProductUpdateRequest> updateRequest = productUpdateRequestRepository
                .findByPartnerProductIdAndUpdateRequestStatus(
                    product.getPartnerProductIdx(), 
                    ProductUpdateRequest.UpdateRequestStatus.PENDING_UPDATE
                );
            
            if (!updateRequest.isPresent()) {
                throw new IllegalStateException("취소할 수정 요청이 없습니다.");
            }
            
            // 수정 요청 취소 상태로 변경
            ProductUpdateRequest request = updateRequest.get();
            request.setUpdateRequestStatus(ProductUpdateRequest.UpdateRequestStatus.CANCELLED_UPDATE);
            productUpdateRequestRepository.save(request);
            
            // 수정 요청 플래그 업데이트
            product.setHasPendingUpdateRequest(false);
            PartnerProduct saved = partnerProductRepository.save(product);
            return convertToProductDto(saved);
        }
        return null;
    }
    
    // 수정 요청 목록 조회
    public List<PartnerProductDto> getUpdateRequests() {
        List<ProductUpdateRequest> updateRequests = productUpdateRequestRepository
            .findByUpdateRequestStatusOrderByCreatedAtDesc(ProductUpdateRequest.UpdateRequestStatus.PENDING_UPDATE);
        
        return updateRequests.stream()
            .map(this::convertUpdateRequestToDto)
            .collect(Collectors.toList());
    }
    
    // 상품 활성화/비활성화 상태 변경
    public void updateProductActiveStatus(Long productId, Boolean isActive) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setIsActive(isActive);
            productRepository.save(product);
        } else {
            throw new RuntimeException("상품을 찾을 수 없습니다: " + productId);
        }
    }
    
    // 수정 요청 생성
    public ProductUpdateRequestDto createUpdateRequest(Long productId, ProductUpdateRequestDto requestDto) {
        Optional<PartnerProduct> existing = partnerProductRepository.findById(productId);
        if (!existing.isPresent()) {
            throw new IllegalStateException("상품을 찾을 수 없습니다.");
        }
        
        PartnerProduct product = existing.get();
        
        // 이미 대기 중인 수정 요청이 있는지 확인
        if (productUpdateRequestRepository.existsByPartnerProductIdAndUpdateRequestStatus(
                product.getPartnerProductIdx(), 
                ProductUpdateRequest.UpdateRequestStatus.PENDING_UPDATE)) {
            throw new IllegalStateException("이미 대기 중인 수정 요청이 있습니다.");
        }
        
        // 현재 상품 데이터를 원본으로 저장
        ProductUpdateRequest updateRequest = ProductUpdateRequest.builder()
            .partnerProductId(product.getPartnerProductIdx())
            .originalProductName(product.getProductName())
            .originalProductContent(product.getProductContent())
            .originalProductImage(product.getProductImage())
            .originalProductLink(product.getProductLink())
            .originalGenderCategory(product.getGenderCategory())
            .originalMajorCategory(product.getMajorCategory())
            .originalSubCategory(product.getSubCategory())
            .originalProductPrice(product.getProductPrice())
            .requestedProductName(requestDto.getRequestedProductName())
            .requestedProductContent(requestDto.getRequestedProductContent())
            .requestedProductImage(requestDto.getRequestedProductImage())
            .requestedProductLink(requestDto.getRequestedProductLink())
            .requestedGenderCategory(requestDto.getRequestedGenderCategory())
            .requestedMajorCategory(requestDto.getRequestedMajorCategory())
            .requestedSubCategory(requestDto.getRequestedSubCategory())
            .requestedProductPrice(requestDto.getRequestedProductPrice())
            .updateRequestReason(requestDto.getUpdateRequestReason())
            .updateRequestStatus(ProductUpdateRequest.UpdateRequestStatus.PENDING_UPDATE)
            .build();
        
        ProductUpdateRequest saved = productUpdateRequestRepository.save(updateRequest);
        
        // 상품의 수정 요청 플래그 업데이트
        product.setHasPendingUpdateRequest(true);
        partnerProductRepository.save(product);
        
        return convertToUpdateRequestDto(saved);
    }
    
    // 수정 요청을 DTO로 변환
    private PartnerProductDto convertUpdateRequestToDto(ProductUpdateRequest updateRequest) {
        PartnerProductDto dto = new PartnerProductDto();
        
        // 기본 상품 정보 (현재 활성화된 데이터)
        dto.setId(updateRequest.getPartnerProductId());
        dto.setProductName(updateRequest.getRequestedProductName());
        dto.setProductContent(updateRequest.getRequestedProductContent());
        dto.setProductImage(updateRequest.getRequestedProductImage());
        dto.setProductLink(updateRequest.getRequestedProductLink());
        dto.setGenderCategory(updateRequest.getRequestedGenderCategory());
        dto.setMajorCategory(updateRequest.getRequestedMajorCategory());
        dto.setSubCategory(updateRequest.getRequestedSubCategory());
        dto.setProductPrice(updateRequest.getRequestedProductPrice());
        
        // 수정 요청 정보
        dto.setUpdateRequestReason(updateRequest.getUpdateRequestReason());
        dto.setUpdateRequestStatus(updateRequest.getUpdateRequestStatus().name());
        dto.setUpdateRequestDate(updateRequest.getUpdateRequestDate());
        dto.setRejectionReason(updateRequest.getRejectionReason());
        
        // 원본 데이터 (비교용)
        dto.setOriginalProductName(updateRequest.getOriginalProductName());
        dto.setOriginalProductContent(updateRequest.getOriginalProductContent());
        dto.setOriginalProductImage(updateRequest.getOriginalProductImage());
        dto.setOriginalProductLink(updateRequest.getOriginalProductLink());
        dto.setOriginalGenderCategory(updateRequest.getOriginalGenderCategory());
        dto.setOriginalMajorCategory(updateRequest.getOriginalMajorCategory());
        dto.setOriginalSubCategory(updateRequest.getOriginalSubCategory());
        dto.setOriginalProductPrice(updateRequest.getOriginalProductPrice());
        
        // 요청된 데이터 (비교용)
        dto.setRequestedProductName(updateRequest.getRequestedProductName());
        dto.setRequestedProductContent(updateRequest.getRequestedProductContent());
        dto.setRequestedProductImage(updateRequest.getRequestedProductImage());
        dto.setRequestedProductLink(updateRequest.getRequestedProductLink());
        dto.setRequestedGenderCategory(updateRequest.getRequestedGenderCategory());
        dto.setRequestedMajorCategory(updateRequest.getRequestedMajorCategory());
        dto.setRequestedSubCategory(updateRequest.getRequestedSubCategory());
        dto.setRequestedProductPrice(updateRequest.getRequestedProductPrice());
        
        // 기본값 설정
        dto.setStatus("PENDING");
        dto.setIsActive(true);
        dto.setCreatedAt(updateRequest.getCreatedAt());
        dto.setUpdatedAt(updateRequest.getUpdatedAt());
        
        return dto;
    }
    
    // ProductUpdateRequest를 ProductUpdateRequestDto로 변환
    private ProductUpdateRequestDto convertToUpdateRequestDto(ProductUpdateRequest updateRequest) {
        return ProductUpdateRequestDto.builder()
            .id(updateRequest.getId())
            .partnerProductId(updateRequest.getPartnerProductId())
            .originalProductName(updateRequest.getOriginalProductName())
            .originalProductContent(updateRequest.getOriginalProductContent())
            .originalProductImage(updateRequest.getOriginalProductImage())
            .originalProductLink(updateRequest.getOriginalProductLink())
            .originalGenderCategory(updateRequest.getOriginalGenderCategory())
            .originalMajorCategory(updateRequest.getOriginalMajorCategory())
            .originalSubCategory(updateRequest.getOriginalSubCategory())
            .originalProductPrice(updateRequest.getOriginalProductPrice())
            .requestedProductName(updateRequest.getRequestedProductName())
            .requestedProductContent(updateRequest.getRequestedProductContent())
            .requestedProductImage(updateRequest.getRequestedProductImage())
            .requestedProductLink(updateRequest.getRequestedProductLink())
            .requestedGenderCategory(updateRequest.getRequestedGenderCategory())
            .requestedMajorCategory(updateRequest.getRequestedMajorCategory())
            .requestedSubCategory(updateRequest.getRequestedSubCategory())
            .requestedProductPrice(updateRequest.getRequestedProductPrice())
            .updateRequestReason(updateRequest.getUpdateRequestReason())
            .updateRequestStatus(updateRequest.getUpdateRequestStatus())
            .updateRequestDate(updateRequest.getUpdateRequestDate())
            .rejectionReason(updateRequest.getRejectionReason())
            .createdAt(updateRequest.getCreatedAt())
            .updatedAt(updateRequest.getUpdatedAt())
            .build();
    }
} 